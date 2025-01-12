import type { Message as BaseMessage } from '../src/types/models';

export interface AnthropicConfig {
  apiKey: string;
  baseUrl?: string;
  version?: string;
}

export interface AnthropicModel {
  type: string;
  id: string;
  display_name: string;
  created_at: string;
}

export interface AnthropicModelsResponse {
  data: AnthropicModel[];
  has_more: boolean;
  first_id: string;
  last_id: string;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  model: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}