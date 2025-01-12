import type { User as FirebaseUser } from 'firebase/auth';

export type ModelType = 'Essential' | 'Advanced' | 'Vision' | 'Tool' | 'Audio' | 'Security';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: ModelType[];
  icon: string;
  isConfigured: boolean;
}

export interface APIConfig {
  provider: string;
  apiKey: string;
  endpoint?: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  modelId: string;
}

export interface ChatContext {
  userInfo: Record<string, string>;
  systemPrompt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  modelId?: string;
  context: ChatContext;
}

export interface FirestoreMessage {
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  modelId: string;
  userId: string;
  userName: string;
}

export interface FirestoreChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  modelId?: string;
  context: ChatContext;
  userId: string;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  id: string;
  content: string;
  model: string;
  role: string;
}

export interface APIError {
  error: string;
  message: string;
}

// Re-export Firebase User type
export type User = FirebaseUser;