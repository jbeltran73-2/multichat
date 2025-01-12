import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  type DocumentData
} from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { encrypt } from './encryption';
import type { ChatSession, APIConfig, FirestoreMessage } from '../types/models';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const signUp = async (email: string, password: string, displayName: string) => {
  console.log('Starting signup process...');
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created:', userCredential.user.uid);

    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
      console.log('Display name updated:', displayName);
    }

    // Get current language from store
    const store = useStore.getState();
    const currentLanguage = store.language;
    console.log('Current store language:', currentLanguage);
    
    // Set language in localStorage first
    localStorage.setItem('language', currentLanguage);
    console.log('Language set in localStorage:', currentLanguage);
    
    // Create user document with language
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, {
      language: currentLanguage,
      createdAt: serverTimestamp()
    });
    console.log('User document created with language:', currentLanguage);
    
    // Update store language
    await store.setLanguage(currentLanguage);
    console.log('Store language updated:', store.language);

    return userCredential.user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  console.log('Starting login process...');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  console.log('Starting Google sign in...');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign in successful:', result.user.uid);

    // Get current language from store
    const store = useStore.getState();
    const currentLanguage = store.language;
    console.log('Current store language:', currentLanguage);
    
    // Set language in localStorage
    localStorage.setItem('language', currentLanguage);
    console.log('Language set in localStorage:', currentLanguage);
    
    // Create or update user document with language
    const userDocRef = doc(db, 'users', result.user.uid);
    await setDoc(userDocRef, {
      language: currentLanguage,
      createdAt: serverTimestamp()
    }, { merge: true });
    console.log('User document updated with language:', currentLanguage);
    
    // Update store language
    await store.setLanguage(currentLanguage);
    console.log('Store language updated:', store.language);

    return result.user;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const saveChatHistory = async (userId: string, chat: ChatSession) => {
  try {
    console.log('Saving chat history:', {
      chatId: chat.id,
      title: chat.title,
      messagesCount: chat.messages.length,
      context: chat.context
    });

    const chatRef = doc(db, 'users', userId, 'chatHistory', chat.id);
    await setDoc(chatRef, {
      ...chat,
      updatedAt: serverTimestamp()
    });

    console.log('Chat history saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving chat history:', error);
    throw error;
  }
};

export const getChatHistory = async (userId: string): Promise<ChatSession[]> => {
  try {
    console.log('Getting chat history for user:', userId);
    const historyRef = collection(db, 'users', userId, 'chatHistory');
    const snapshot = await getDocs(historyRef);

    const chats = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Processing chat document:', {
        id: doc.id,
        title: data.title,
        messagesCount: data.messages?.length || 0,
        hasContext: !!data.context
      });

      return {
        id: doc.id,
        title: data.title || 'New Chat',
        messages: Array.isArray(data.messages) ? data.messages : [],
        createdAt: typeof data.createdAt === 'number' ? data.createdAt :
                  data.createdAt?.toMillis?.() ||
                  data.updatedAt?.toMillis?.() ||
                  Date.now(),
        modelId: data.modelId,
        context: data.context || { userInfo: {}, systemPrompt: '' }
      } as ChatSession;
    });

    console.log('Retrieved chat history:', {
      totalChats: chats.length,
      chats: chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        messagesCount: chat.messages.length,
        hasContext: !!chat.context
      }))
    });

    return chats;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

export const saveApiConfig = async (userId: string, config: APIConfig) => {
  try {
    const encryptedKey = await encrypt(config.apiKey);
    const configRef = doc(db, 'users', userId, 'apiConfigs', config.provider);
    await setDoc(configRef, {
      ...config,
      apiKey: encryptedKey
    });
    return true;
  } catch (error) {
    console.error('Error saving API config:', error);
    throw error;
  }
};

import { decrypt } from './encryption';

export const getApiConfigs = async (userId: string): Promise<APIConfig[]> => {
  try {
    console.log('Getting API configs for user:', userId);
    const configsRef = collection(db, 'users', userId, 'apiConfigs');
    const snapshot = await getDocs(configsRef);
    
    const configs = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      // Decrypt the API key
      const decryptedKey = await decrypt(data.apiKey);
      return {
        ...data,
        apiKey: decryptedKey,
        provider: doc.id // Include the document ID as provider
      } as APIConfig;
    }));
    
    console.log('Retrieved API configs:', configs.map(c => ({ provider: c.provider })));
    return configs;
  } catch (error) {
    console.error('Error getting API configs:', error);
    throw error;
  }
};

export const deleteUserAndData = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { deleted: true }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};

export const updateUserLanguage = async (userId: string, language: string) => {
  try {
    console.log('Updating user language:', { userId, language });
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { language }, { merge: true });
    
    // Update store language
    const store = useStore.getState();
    await store.setLanguage(language);
    
    // Update localStorage
    localStorage.setItem('language', language);
    
    console.log('Language updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating user language:', error);
    throw error;
  }
};

export const getChatDocument = async (userId: string, chatId: string) => {
  try {
    console.log('Getting chat document:', { userId, chatId });
    const chatRef = doc(db, 'users', userId, 'chatHistory', chatId);
    return await getDoc(chatRef);
  } catch (error) {
    console.error('Error getting chat document:', error);
    throw error;
  }
};

export const saveChatMessage = async (message: FirestoreMessage, chatId: string) => {
  try {
    console.log('Saving chat message:', { chatId, message });
    const chatRef = doc(db, 'users', message.userId, 'chatHistory', chatId);
    
    // Get current chat data
    const chatDoc = await getDoc(chatRef);
    const currentData = chatDoc.data();
    const currentMessages = currentData?.messages || [];
    
    // Append new message to existing messages
    const updatedMessages = [...currentMessages, message];
    
    // Update the document with merged messages
    await setDoc(chatRef, {
      messages: updatedMessages,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log('Chat message saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};