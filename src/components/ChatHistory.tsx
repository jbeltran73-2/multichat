import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { translations } from '../utils/translations';
import { formatDate } from '../utils/dateFormatter';
import type { ChatSession } from '../types/models';

export const ChatHistory: React.FC = () => {
  const { user, currentChatId, loadChat, deleteChat, chatHistory: storeChats, language } = useStore();
  const [chats, setChats] = useState<ChatSession[]>(storeChats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update local state when store chatHistory changes
  useEffect(() => {
    console.log('Store chatHistory updated:', {
      count: storeChats.length,
      chats: storeChats.map(c => ({ id: c.id, title: c.title }))
    });
    setChats(storeChats);
  }, [storeChats]);

  // Set up Firebase real-time listener
  useEffect(() => {
    if (!user) {
      console.log('No user found, clearing chats');
      setChats([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('Setting up chat history listener for user:', user.uid);

    const db = getFirestore();
    const historyRef = collection(db, 'users', user.uid, 'chatHistory');
    const q = query(historyRef, orderBy('createdAt', 'desc'));

    console.log('Subscribing to Firebase collection:', `users/${user.uid}/chatHistory`);
    const unsubscribe = onSnapshot(q,
      async (snapshot) => {
        console.log('Received Firebase update:', {
          totalDocs: snapshot.docs.length,
          empty: snapshot.empty,
          metadata: snapshot.metadata
        });

        if (snapshot.empty) {
          console.log('No chats found in Firebase');
          setChats([]);
          setIsLoading(false);
          return;
        }

        try {
          const firebaseChats = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();
            console.log('Processing Firebase document:', {
              docId: doc.id,
              data: JSON.stringify(data, null, 2)
            });

            if (!data) {
              console.error('Empty document data for doc:', doc.id);
              return null;
            }

            // Get the full chat document to ensure we have all messages
            const chatDoc = await getDoc(doc.ref);
            const fullData = chatDoc.data();

            const chat: ChatSession = {
              id: data.id || doc.id,
              title: data.title || (data.messages?.[0]?.content?.slice(0, 50) + '...') || 'New Chat',
              messages: Array.isArray(fullData?.messages) ? fullData.messages : [],
              createdAt: data.createdAt || data.updatedAt || Date.now(),
              modelId: data.modelId,
              context: data.context || { userInfo: {}, systemPrompt: '' }
            };

            return chat;
          }));

          // Filter out null values and sort
          const validChats = firebaseChats
            .filter((chat): chat is ChatSession => chat !== null)
            .sort((a, b) => b.createdAt - a.createdAt);

          console.log('Processed chat history:', {
            totalChats: validChats.length,
            chats: validChats.map(chat => ({
              id: chat.id,
              title: chat.title,
              messagesCount: chat.messages.length
            }))
          });

          setChats(validChats);
          setIsLoading(false);
          setError(null);
        } catch (error) {
          console.error('Error processing chat history:', error);
          setError('Failed to process chat history');
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Firebase error:', err);
        setError('Failed to load chat history');
        setIsLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up Firebase listener');
      unsubscribe();
    };
  }, [user]);

  const handleChatClick = async (chatId: string) => {
    try {
      console.log('Loading chat:', chatId);
      const chat = chats.find(c => c.id === chatId);
      if (!chat) {
        console.error('Chat not found in local state:', chatId);
        return;
      }

      // Get fresh data from Firebase
      const db = getFirestore();
      const chatRef = doc(db, 'users', user!.uid, 'chatHistory', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        console.error('Chat document not found in Firebase:', chatId);
        return;
      }

      const data = chatDoc.data();
      console.log('Fresh chat data:', {
        id: chatId,
        messages: data.messages?.length || 0
      });

      // Update the chat in local state with fresh data
      const updatedChat = {
        ...chat,
        messages: Array.isArray(data.messages) ? data.messages : []
      };
  
      setChats(current =>
        current.map(c => c.id === chatId ? updatedChat : c)
      );
      
      // Load the chat in the store with fresh data
      const { messages, context } = updatedChat;
      await loadChat(chatId, messages, context);
    } catch (error) {
      console.error('Error loading chat:', error);
      setError('Failed to load chat');
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-sm text-gray-400">
        Please log in to view chat history
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-3 space-y-1 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
              chat.id === currentChatId ? 'bg-gray-50' : ''
            }`}
          >
            <div className="flex justify-between items-center cursor-pointer" onClick={() => handleChatClick(chat.id)}>
              <div className="flex-1 min-w-0 mr-2">
                <div className="text-sm font-medium truncate">{chat.title || 'Untitled Chat'}</div>
                <div className="text-xs text-gray-500">{formatDate(chat.createdAt)}</div>
              </div>
              <button
                className="shrink-0 p-1 hover:bg-gray-200 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                title="Delete chat"
              >
                <svg className="w-4 h-4 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-sm text-gray-400 italic p-4">
          {translations[language].noConversationsYet}
        </div>
      )}
    </div>
  );
};