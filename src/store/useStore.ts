import { create } from 'zustand';
import { loadStoredConfigs } from '../utils/config/loadConfig';
import { validateConfig } from '../utils/config/configValidator';
import { handleAPIError } from '../utils/error/errorHandler';
import { fetchModels } from '../utils/apiManager';
import { generateTitle } from '../utils/titleGenerator';
import { getFirestore, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import {
  saveChatHistory,
  getChatHistory,
  saveApiConfig,
  getApiConfigs,
  saveChatMessage,
  getChatDocument
} from '../utils/firebase';
import type { AIModel, APIConfig, Message, ChatContext, ChatSession } from '../types/models';
import type { User } from 'firebase/auth';

const PROVIDER_ICONS: Record<string, string> = {
  openai: '/provider-icons/openai-logo.png',
  anthropic: '/provider-icons/anthropic-logo.png',
  gemini: '/provider-icons/gemini-logo.png',
  groq: '/provider-icons/groq-logo.jpg',
  deepseek: '/provider-icons/deepseek-logo.webp',
  xai: '/provider-icons/xai-logo.webp',
  ollama: '/provider-icons/ollama-logo.png',
  cerebras: '/provider-icons/cerebras-logo.png'
};

const DEFAULT_CONTEXT: ChatContext = {
  userInfo: {},
  systemPrompt: ''
};

interface State {
  models: AIModel[];
  selectedModel: AIModel | null;
  apiConfigs: APIConfig[];
  messages: Message[];
  chatHistory: ChatSession[];
  currentChatId: string | null;
  currentContext: ChatContext;
  isConfigPanelOpen: boolean;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  user: User | null;
  language: string;
  setUser: (user: User | null) => void;
  loadUserChatHistory: () => Promise<void>;
  loadApiConfigs: () => Promise<void>;
  toggleConfigPanel: () => void;
  setError: (error: string | null) => void;
  addApiConfig: (config: APIConfig) => Promise<void>;
  removeApiConfig: (provider: string) => void;
  selectModel: (model: AIModel) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  startNewChat: () => Promise<void>;
  loadChat: (chatId: string, messages?: Message[], context?: ChatContext) => Promise<void>;
  updateUserInfo: (key: string, value: string) => void;
  initializeModels: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  models: [],
  selectedModel: null,
  apiConfigs: [],
  messages: [],
  chatHistory: [],
  currentChatId: null,
  currentContext: DEFAULT_CONTEXT,
  isConfigPanelOpen: false,
  isLoading: false,
  error: null,
  initialized: false,
  user: null,
  language: localStorage.getItem('language') || 'en',

  setUser: (user: User | null) => {
    console.log('Setting user:', user?.uid);
    set({ user });
    if (user) {
      console.log('Loading user data...');
      
      // Clear existing state first
      set({
        chatHistory: [],
        messages: [],
        currentChatId: null,
        currentContext: DEFAULT_CONTEXT,
        apiConfigs: [],
        models: [],
        error: null
      });

      // Load fresh data from Firebase
      Promise.all([
        get().loadUserChatHistory(),
        get().loadApiConfigs(),
        get().loadLanguage()
      ]).then(() => {
        console.log('User data loaded successfully');
        
        // Initialize models after API configs are loaded
        const { apiConfigs } = get();
        if (apiConfigs.length > 0) {
          console.log('Initializing models with loaded API configs');
          get().initializeModels();
        }
      }).catch(error => {
        console.error('Error loading user data:', error);
        set({ error: 'Failed to load user data' });
      });
    } else {
      // Clear all state on logout
      set({
        chatHistory: [],
        messages: [],
        currentChatId: null,
        currentContext: DEFAULT_CONTEXT,
        apiConfigs: [],
        models: [],
        error: null,
        initialized: false
      });

      // Clear local storage
      localStorage.clear();
    }
  },

  loadUserChatHistory: async () => {
    const { user } = get();
    if (!user) {
      console.log('No user found, skipping chat history load');
      return;
    }

    try {
      set({ isLoading: true });
      console.log('Loading chat history for user:', user.uid);
      const history = await getChatHistory(user.uid);
      console.log('Raw history from Firebase:', history);

      if (!history || history.length === 0) {
        console.log('No chat history found');
        set({ 
          chatHistory: [],
          isLoading: false,
          currentChatId: null,
          messages: []
        });
        return;
      }

      // Convert and sort chat history
      console.log('Processing chat history...');
      const chatHistory = history
        .map(data => ({
          id: data.id,
          title: data.title || 'New Chat',
          messages: data.messages || [],
          createdAt: data.createdAt || Date.now(),
          modelId: data.modelId,
          context: data.context || DEFAULT_CONTEXT
        }))
        .sort((a, b) => b.createdAt - a.createdAt) as ChatSession[];

      console.log('Processed chat history:', {
        totalChats: chatHistory.length,
        chats: chatHistory.map(chat => ({
          id: chat.id,
          title: chat.title,
          messages: chat.messages.length
        }))
      });

      // Update state with processed chat history
      set({
        chatHistory,
        isLoading: false
      });

      // If there's no current chat but we have history, load the most recent chat
      const state = get();
      if (!state.currentChatId && chatHistory.length > 0) {
        const mostRecentChat = chatHistory[0];
        console.log('Loading most recent chat:', {
          id: mostRecentChat.id,
          title: mostRecentChat.title,
          messages: mostRecentChat.messages.length
        });
        await get().loadChat(mostRecentChat.id);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      set({ 
        error: 'Failed to load chat history',
        isLoading: false 
      });
    }
  },

  loadApiConfigs: async () => {
    const { user } = get();
    if (!user) {
      console.log('No user found, skipping API configs load');
      return;
    }

    console.log('Loading API configs for user:', user.uid);
    set({ isLoading: true, error: null });

    try {
      // Clear local storage for API configs and models
      Object.keys(localStorage)
        .filter(key => key.startsWith('api_config_') || key.startsWith('models_'))
        .forEach(key => localStorage.removeItem(key));

      // Load fresh configs from Firebase
      const configs = await getApiConfigs(user.uid);
      console.log('Loading fresh API configs from Firebase:', configs.map(c => ({ provider: c.provider })));

      // Initialize arrays for models and errors
      const allModels: AIModel[] = [];
      const errors: string[] = [];

      // Update state with fresh configs
      set({
        apiConfigs: configs,
        isLoading: true // Keep loading while fetching models
      });

      // Process each config
      for (const config of configs) {
        try {
          console.log('Processing config for provider:', config.provider);
          
          if (!config.apiKey) {
            console.error('Missing API key for provider:', config.provider);
            errors.push(`Missing API key for ${config.provider}`);
            continue;
          }

          // Validate provider
          if (!PROVIDER_ICONS[config.provider]) {
            console.error('Invalid provider:', config.provider);
            errors.push(`Invalid provider: ${config.provider}`);
            continue;
          }

          console.log('Fetching models for provider:', config.provider);
          const models = await fetchModels(config);
          console.log('Fetched models for provider:', config.provider, models);

          if (models && models.length > 0) {
            const configuredModels = models.map(model => ({
              ...model,
              provider: config.provider,
              isConfigured: true,
              icon: PROVIDER_ICONS[config.provider] || ''
            }));
            allModels.push(...configuredModels);

            // Store config and models in local storage
            localStorage.setItem(`api_config_${config.provider}`, JSON.stringify({
              provider: config.provider,
              apiKey: config.apiKey
            }));
            localStorage.setItem(`models_${config.provider}`, JSON.stringify(configuredModels));

            console.log('Stored config and models for provider:', config.provider);
          } else {
            console.warn('No models returned for provider:', config.provider);
            errors.push(`No models available for ${config.provider}`);
          }
        } catch (error) {
          console.error('Error processing provider:', config.provider, error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          if (errorMessage.includes('decrypt')) {
            errors.push(`Failed to decrypt API key for ${config.provider}`);
          } else if (errorMessage.includes('API key')) {
            errors.push(`Invalid API key for ${config.provider}`);
          } else {
            errors.push(`Failed to load models for ${config.provider}: ${errorMessage}`);
          }
        }
      }

      // Update state with all models
      set(state => ({
        models: allModels.sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
        error: errors.length > 0 ? errors.join('. ') : null,
        initialized: true
      }));

      console.log('API configs and models loaded successfully');
    } catch (error) {
      console.error('Error loading API configs:', error);
      set({ 
        error: 'Failed to load API configurations. Please try again.',
        isLoading: false 
      });
    }
  },

  toggleConfigPanel: () => {
    set((state) => ({ isConfigPanelOpen: !state.isConfigPanelOpen }));
  },

  setError: (error: string | null) => set({ error }),

  addApiConfig: async (config: APIConfig) => {
    const { user } = get();
    if (!user) {
      throw new Error('User not authenticated');
    }

    set({ isLoading: true, error: null });
    
    try {
      const error = validateConfig(config);
      if (error) {
        throw new Error(error);
      }

      // Save encrypted config to Firebase first
      await saveApiConfig(user.uid, config);
      console.log('API config saved to Firebase');

      // Then fetch models
      console.log('Fetching models for:', config.provider);
      const models = await fetchModels(config);
      console.log('Fetched models:', models);
      
      if (!models || models.length === 0) {
        throw new Error('No models available for this provider');
      }

      const newModels = models.map(model => ({
        ...model,
        provider: config.provider,
        isConfigured: true,
        icon: PROVIDER_ICONS[config.provider] || ''
      }));

      set((state) => {
        const updatedModels = [
          ...state.models.filter(m => m.provider !== config.provider),
          ...newModels
        ].sort((a, b) => a.name.localeCompare(b.name));

        const updatedConfigs = [
          ...state.apiConfigs.filter(c => c.provider !== config.provider),
          config
        ];

        return {
          apiConfigs: updatedConfigs,
          models: updatedModels,
          isLoading: false,
          initialized: true
        };
      });
    } catch (error) {
      console.error('Error adding API config:', error);
      set({ 
        error: handleAPIError(error, config.provider),
        isLoading: false 
      });
    }
  },

  removeApiConfig: (provider: string) => {
    set((state) => ({
      apiConfigs: state.apiConfigs.filter(c => c.provider !== provider),
      models: state.models.filter(m => m.provider !== provider)
    }));
  },

  selectModel: (model: AIModel) => {
    console.log('Selecting model:', model.name);
    const { currentChatId } = get();

    set((state) => {
      // If we have an active chat, preserve its messages and context
      if (currentChatId) {
        console.log('Switching model within current chat:', {
          messagesCount: state.messages.length,
          context: state.currentContext,
          chatId: currentChatId
        });

        return {
          selectedModel: model,
          messages: state.messages,
          currentContext: state.currentContext,
          currentChatId: currentChatId
        };
      }

      // If no active chat, just update the selected model
      console.log('Setting model without active chat');
      return {
        selectedModel: model,
        messages: [],
        currentContext: DEFAULT_CONTEXT,
        currentChatId: null
      };
    });
  },

  addMessage: async (message: Message) => {
    const { currentChatId, chatHistory, currentContext, user } = get();
    if (!user || !currentChatId) return;
    
    try {
      // Find current chat
      const currentChat = chatHistory.find(chat => chat.id === currentChatId);
      if (!currentChat) {
        console.error('Current chat not found:', currentChatId);
        return;
      }

      // Create updated messages array for the current chat
      const updatedMessages = [...currentChat.messages, message];
      
      // Generate title if this is a user message and chat has default title
      let title = currentChat.title;
      const isFirstMessage = currentChat.messages.length === 0;
      if (message.role === 'user' && (!title || title === 'New Chat')) {
        const newTitle = message.content?.slice(0, 50) + '...';
        title = newTitle;
      
        // Update the chat title in chatHistory
        set((state) => ({
          chatHistory: state.chatHistory.map((chat) =>
            chat.id === currentChatId ? { ...chat, title } : chat
          ),
        }));
      }

      // Create updated chat object
      const updatedChat = {
        ...currentChat,
        messages: updatedMessages,
        context: currentContext,
        title
      };

      // Update local state first
      set((state) => ({
        messages: updatedMessages,
        chatHistory: state.chatHistory.map(chat =>
          chat.id === currentChatId ? updatedChat : chat
        )
      }));

      // Save individual message to Firebase
      const firestoreMessage = {
        ...message,
        userId: user.uid,
        userName: user.displayName || 'User',
        timestamp: Date.now()
      };
      
      await saveChatMessage(firestoreMessage, currentChatId);
      console.log('Message saved to Firebase for chat:', currentChatId);
    } catch (error) {
      console.error('Error adding message:', error);
      set({ error: 'Failed to save message' });
    }
  },

  clearMessages: async () => {
    const { selectedModel } = get();
    if (!selectedModel) {
      set({ error: 'Please select a model first' });
      return;
    }
    await get().startNewChat();
  },

  startNewChat: async () => {
    const { selectedModel, user, currentChatId } = get();
    if (!user) {
      console.error('Cannot start new chat: User not authenticated');
      return;
    }

    try {
      // Clear current chat state
      set({
        messages: [],
        currentChatId: null,
        currentContext: DEFAULT_CONTEXT,
        selectedModel: selectedModel, // Preserve selected model
        error: null
      });

      const timestamp = Date.now();
      const newChat: ChatSession = {
        id: timestamp.toString(),
        title: '',
        messages: [],
        createdAt: timestamp,
        modelId: selectedModel?.id,
        context: { ...DEFAULT_CONTEXT }
      };

      console.log('Creating new chat:', {
        chatId: newChat.id,
        title: newChat.title,
        modelId: newChat.modelId,
        previousChatId: currentChatId
      });

      // Save to Firebase
      await saveChatHistory(user.uid, newChat);
      console.log('New chat saved to Firebase successfully');

      // Update local state
      set((state) => ({
        currentChatId: newChat.id,
        messages: [],
        chatHistory: [newChat, ...state.chatHistory],
        currentContext: DEFAULT_CONTEXT
      }));

      // Validate chat creation
      const currentState = get();
      if (currentState.currentChatId !== newChat.id) {
        console.error('Chat creation validation failed');
        set({
          messages: [],
          currentChatId: null,
          currentContext: DEFAULT_CONTEXT,
          error: 'Failed to create new chat'
        });
        return;
      }

      console.log('New chat successfully created and validated');
    } catch (error) {
      console.error('Error creating new chat:', error);
      set({ error: 'Failed to create new chat' });
    }
  },

  loadChat: async (chatId: string, messages?: Message[], context?: ChatContext) => {
    console.log('Loading chat:', chatId);
    const { user, chatHistory, models, apiConfigs } = get();
    if (!user) return;

    try {
      // Set loading state
      set({ isLoading: true, error: null });

      // Check if chat is already loaded locally
      const existingChat = chatHistory.find(chat => chat.id === chatId);
      if (existingChat && !messages) {
        console.log('Loading chat from local state:', chatId);
        set({
          currentChatId: chatId,
          messages: existingChat.messages,
          selectedModel: models.find(m => m.id === existingChat.modelId) || null,
          currentContext: existingChat.context || DEFAULT_CONTEXT,
          isLoading: false
        });
        return;
      }

      // Load from Firebase if not found locally
      const chatDoc = await getChatDocument(user.uid, chatId);
      if (!chatDoc.exists()) {
        console.error('Chat document not found:', chatId);
        set({
          error: 'Chat not found',
          isLoading: false
        });
        return;
      }

      const chatData = chatDoc.data();
      if (!chatData) {
        console.error('Chat data is empty:', chatId);
        set({
          error: 'Chat data is empty',
          isLoading: false
        });
        return;
      }

      console.log('Loaded chat from Firebase:', {
        id: chatId,
        title: chatData.title,
        messages: chatData.messages?.length || 0,
        modelId: chatData.modelId
      });

      // Find the model for this chat
      let selectedModel: AIModel | null = null;
      const originalModel = models.find(m => m.id === chatData.modelId);
      
      if (originalModel) {
        console.log('Found original model:', originalModel.name);
        // Verify API config exists for the model's provider
        const config = apiConfigs.find(c => c.provider === originalModel.provider);
        if (!config) {
          console.error('No API config found for provider:', originalModel.provider);
          set({
            currentChatId: chatId,
            messages: [],
            selectedModel: null,
            currentContext: DEFAULT_CONTEXT,
            error: `Please configure API key for ${originalModel.provider} to view this chat`,
            isLoading: false
          });
          return;
        }
        selectedModel = originalModel;
      } else {
        console.warn('Original model not found for chat:', chatData.modelId);
        // Try to find a compatible model from the same provider
        const chatProvider = chatData.modelId?.split('/')[0];
        if (chatProvider) {
          const compatibleModel = models.find(m => m.provider === chatProvider);
          if (compatibleModel) {
            console.log('Found compatible model:', compatibleModel.name);
            selectedModel = compatibleModel;
          }
        }
      }

      // Generate title if needed
      const title = chatData.title || (chatData.messages?.length > 0
        ? generateTitle(chatData.messages)
        : 'New Chat');

      // Update local state with chat data
      set({
        currentChatId: chatId,
        messages: messages || chatData.messages || [],
        selectedModel,
        currentContext: context || chatData.context || DEFAULT_CONTEXT,
        isLoading: false,
        error: selectedModel ? null : 'The model used in this chat is no longer available'
      });

      // Update chat history with the loaded chat
      set(state => ({
        chatHistory: [
          {
            id: chatId,
            title,
            messages: messages || chatData.messages || [],
            createdAt: chatData.createdAt || Date.now(),
            modelId: chatData.modelId,
            context: context || chatData.context || DEFAULT_CONTEXT
          },
          ...state.chatHistory.filter(chat => chat.id !== chatId)
        ]
      }));

      console.log('Chat loaded successfully:', chatId);
      console.log('Value of messages argument:', messages);
      console.log('Value of chatData.messages:', chatData.messages);
      console.log('Final messages state being set:', messages || chatData.messages || []);
    } catch (error) {
      console.error('Error loading chat:', error);
      set({
        error: 'Failed to load chat',
        messages: [],
        selectedModel: null,
        currentContext: DEFAULT_CONTEXT
      });
    }
  },

  updateUserInfo: (key: string, value: string) => {
    set((state) => {
      const newContext = {
        ...state.currentContext,
        userInfo: {
          ...state.currentContext.userInfo,
          [key]: value
        }
      };

      const updatedHistory = state.chatHistory.map(chat => 
        chat.id === state.currentChatId
          ? { ...chat, context: newContext }
          : chat
      );

      return {
        currentContext: newContext,
        chatHistory: updatedHistory
      };
    });
  },

  deleteChat: async (chatId: string) => {
    const { user, currentChatId } = get();
    if (!user) return;

    try {
      // Delete from Firebase
      const db = getFirestore();
      const chatRef = doc(db, 'users', user.uid, 'chatHistory', chatId);
      await deleteDoc(chatRef);
      console.log('Chat deleted from Firebase:', chatId);

      // Update local state
      set(state => ({
        chatHistory: state.chatHistory.filter(chat => chat.id !== chatId),
        // If current chat is deleted, reset all state
        messages: state.currentChatId === chatId ? [] : state.messages,
        currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        currentContext: state.currentChatId === chatId ? DEFAULT_CONTEXT : state.currentContext,
        selectedModel: state.currentChatId === chatId ? null : state.selectedModel,
        error: null
      }));

      // Validate state after deletion
      const currentState = get();
      if (currentState.currentChatId === chatId) {
        console.error('Chat deletion state validation failed');
        set({
          messages: [],
          currentChatId: null,
          currentContext: DEFAULT_CONTEXT,
          selectedModel: null,
          error: 'Failed to properly delete chat'
        });
      }

      console.log('Chat successfully deleted and state validated');
    } catch (error) {
      console.error('Error deleting chat:', error);
      set({
        error: 'Failed to delete chat',
        messages: currentChatId === chatId ? [] : get().messages,
        currentChatId: currentChatId === chatId ? null : currentChatId
      });
    }
  },

  setLanguage: async (language: string) => {
    const { user } = get();
    if (!user) return;
    
    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { language });
      set({ language });
    } catch (error) {
      console.error('Error saving language preference:', error);
      set({ error: 'Failed to save language preference' });
    }
  },

  loadLanguage: async () => {
    const { user } = get();
    if (!user) return;
    
    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData?.language) {
          set({ language: userData.language });
        }
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
      set({ error: 'Failed to load language preference' });
    }
  },

  initializeModels: async () => {
    if (get().initialized) return;

    console.log('Initializing models...');
    set({ isLoading: true, error: null });

    const storedConfigs = loadStoredConfigs();
    console.log('Loaded stored configs:', storedConfigs);
    const allModels: AIModel[] = [];

    try {
      for (const config of storedConfigs) {
        try {
          console.log('Fetching models for:', config.provider);
          const models = await fetchModels(config);
          console.log('Fetched models:', models);
          
          if (models && models.length > 0) {
            const configuredModels = models.map(model => ({
              ...model,
              provider: config.provider,
              isConfigured: true,
              icon: PROVIDER_ICONS[config.provider] || ''
            }));
            allModels.push(...configuredModels);
          }
        } catch (error) {
          console.error('Error fetching models for provider:', config.provider, error);
        }
      }

      console.log('All models:', allModels);
      set({ 
        models: allModels.sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
        initialized: true
      });
    } catch (error) {
      console.error('Error initializing models:', error);
      set({ 
        error: 'Failed to initialize models',
        isLoading: false 
      });
    }
  }
}));