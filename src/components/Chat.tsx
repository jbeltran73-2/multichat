// Copyright (c) 2025 Juan Beltrán
// Licensed under the MIT License. See LICENSE file for details.

import React, { useState, useRef, useEffect } from 'react';
import { Send, Eraser, Star, Paperclip, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStore } from '../store/useStore';
import { sendMessage } from '../utils/chatManager';
import { translations } from '../utils/translations';
import { LoadingDots } from './LoadingDots';
import { saveChatMessage } from '../utils/firebase';
import type { Message, FirestoreMessage } from '../types/models';

const EnhancePromptButton: React.FC<{
  onEnhance: () => void;
  disabled: boolean;
  apiConfigs: { provider: string }[];
  language: string;
}> = ({ onEnhance, disabled, apiConfigs, language }) => {
  return (
    <div className="relative group">
      <button
        onClick={onEnhance}
        disabled={disabled}
        className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
          disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
        }`}
        aria-label="Enhance prompt with AI"
        title="Enhance prompt with AI"
      >
        <Star className="w-5 h-5 text-white" />
      </button>
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-sm py-1 px-2 rounded-md pointer-events-none whitespace-nowrap"
        role="tooltip"
      >
        {apiConfigs.some(c => c.provider === 'groq') ? translations[language].enhancePrompt : translations[language].groq}
      </div>
    </div>
  );
};

export const Chat: React.FC = () => {
  const { 
    messages, 
    addMessage, 
    selectedModel,
    apiConfigs,
    setError,
    error,
    clearMessages,
    currentContext,
    updateUserInfo,
    user,
    currentChatId,
    startNewChat,
    language
  } = useStore();
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayText]);

  useEffect(() => {
    if (input === '' && !isLoading) {
      inputRef.current?.focus();
    }
  }, [input, isLoading]);

  useEffect(() => {
    console.log('Chat component - Selected model changed:', selectedModel);
    if (selectedModel) {
      const config = apiConfigs.find(c => c.provider === selectedModel.provider);
      console.log('Found API config:', config?.provider);
      if (!config) {
        setError('No API configuration found for the selected model');
      } else {
        setError(null);
      }
    }
  }, [selectedModel, apiConfigs, setError]);

  useEffect(() => {
    const userInfoRegex = /my (?:name is|email is|phone is|age is) ([\w@\.\s]+)/i;
    messages.forEach(message => {
      if (message.role === 'user') {
        const match = message.content.match(userInfoRegex);
        if (match) {
          const value = match[1].trim();
          const key = match[0].toLowerCase().includes('name') ? 'name' :
                     match[0].toLowerCase().includes('email') ? 'email' :
                     match[0].toLowerCase().includes('phone') ? 'phone' :
                     match[0].toLowerCase().includes('age') ? 'age' : null;
          
          if (key && value) {
            updateUserInfo(key, value);
          }
        }
      }
    });
  }, [messages, updateUserInfo]);

  const simulateTyping = (text: string) => {
    let index = 0;
    setDisplayText('');
    
    const chunkSize = Math.max(50, Math.floor(text.length / 2));
    
    const interval = setInterval(() => {
      if (index < text.length) {
        const chunk = text.slice(index, index + chunkSize);
        setDisplayText(prev => prev + chunk);
        index += chunkSize;
      } else {
        clearInterval(interval);
        setDisplayText(text);
        inputRef.current?.focus();
      }
    }, 0);
  };

  const handleEnhancePrompt = async () => {
    if (!input.trim() || !selectedModel || isLoading) return;

    const groqConfig = apiConfigs.find(c => c.provider === 'groq');
    if (!groqConfig) {
      setError('Groq API configuration not found. Please configure your Groq API key in the settings panel.');
      return;
    }

    if (!groqConfig.apiKey) {
      setError('Groq API key is required. Please configure your API key in the settings.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const enhancePrompt = `Please enhance the following prompt to be more detailed, specific, and effective: "${input}"`;
      
      const response = await sendMessage(
        enhancePrompt,
        groqConfig,
        'llama-3.3-70b-versatile',
        currentContext,
        messages
      );

      setInput(response.replace(/^["']|["']$/g, ''));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to enhance prompt');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 20MB)
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds the maximum limit of 20MB');
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setSelectedFile(file);
      setInput(`[${file.name}]`); // Update input field with file name
      setFileContent(content);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setInput('');
    setFileContent('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedModel || (!input.trim() && !selectedFile)) return;
  
    const config = apiConfigs.find(c => c.provider === selectedModel.provider);
    if (!config) {
      setError('No API configuration found for the selected model');
      return;
    }

    if (!user) {
      setError('User not authenticated');
      return;
    }

    let chatId = currentChatId;
    
    if (!chatId) {
      try {
        await startNewChat();
        // Get the updated currentChatId after creating new chat
        chatId = useStore.getState().currentChatId;
        if (!chatId) {
          setError('Failed to create new chat');
          return;
        }
      } catch (error) {
        setError('Failed to create new chat');
        return;
      }
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const messageContent = selectedFile
        ? `File: ${selectedFile.name}\n${input}\n\nFile Content:\n${fileContent}`
        : input;
  
      const userMessage: Message = {
        id: Date.now().toString(),
        content: messageContent,
        role: 'user',
        timestamp: Date.now(),
        modelId: selectedModel.id,
      };

      // Add message to local state first
      addMessage(userMessage);
      setInput('');
      inputRef.current?.focus();

      // Save to Firestore
      const messageData: FirestoreMessage = {
        role: userMessage.role,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        modelId: userMessage.modelId,
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous'
      };
      
      await saveChatMessage(messageData, chatId);
  
      const fileData = selectedFile ? {
        mime_type: selectedFile.type,
        data: fileContent.split(',')[1], // Extract base64 data part
      } : undefined;
  
      const response = await sendMessage(
        messageContent,
        config,
        selectedModel.id,
        currentContext,
        messages,
        fileData
      );
      simulateTyping(response);
  
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: Date.now(),
        modelId: selectedModel.id,
      };

      addMessage(assistantMessage);

      // Save assistant message to Firestore
      await saveChatMessage({
        role: assistantMessage.role,
        content: assistantMessage.content,
        timestamp: assistantMessage.timestamp,
        modelId: assistantMessage.modelId,
        userId: user.uid,
        userName: 'AI Assistant'
      }, chatId);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get response from AI');
      inputRef.current?.focus();
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      setFileContent('');
      inputRef.current?.focus();
    }
  };
    
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-gray-900 shadow-sm border border-gray-100'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="relative">
                  <button
                    onClick={() => handleCopy(message.id, message.content)}
                    className="absolute right-0 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                  >
                    {copiedMessageId === message.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-sm max-w-none mr-8"
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              {message.role === 'user' && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="prose prose-sm max-w-none"
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <LoadingDots />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t p-4 bg-white"
      >
        <div className="flex flex-col-reverse sm:flex-row items-end sm:items-center space-y-reverse space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 w-full">
            <textarea
              ref={inputRef}
              value={selectedFile ? `[${selectedFile.name}]` : input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedModel ? translations[language].typeMessage : translations[language].selectModelToStart}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none"
              disabled={!selectedModel || isLoading}
              rows={1}
              readOnly={!!selectedFile}
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {selectedModel?.provider !== 'xai' && (
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={!selectedModel || isLoading}
                  accept=".pdf,.txt,.md,.csv,.json,image/*"
                />
                <div className="relative group">
                  <div className="px-2 py-1 opacity-50">
                    <Paperclip className="w-5 h-5 text-gray-500 pointer-events-none select-none" />
                  </div>
                  <div
                    className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-sm py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-10"
                    role="tooltip"
                  >
                    {translations[language].underDevelopment}
                  </div>
                </div>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Remove file"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            <EnhancePromptButton
              onEnhance={handleEnhancePrompt}
              disabled={!selectedModel || isLoading || (!!selectedFile && selectedModel.provider !== 'groq') || !input.trim() || !apiConfigs.some(c => c.provider === 'groq')}
              apiConfigs={apiConfigs}
              language={language}
            />
            <button
              type="button"
              onClick={clearMessages}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Clear chat"
            >
              <Eraser className="w-5 h-5" />
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-gray-700 text-white rounded-md transition-colors ${
                !selectedModel || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
              }`}
              disabled={!selectedModel || isLoading}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};