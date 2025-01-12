export type AnthropicRole = 'user' | 'assistant';

export interface AnthropicMessage {
  role: AnthropicRole;
  content: string;
}

export interface AnthropicModel {
  type: string;
  id: string;
  display_name?: string;
  created_at: string;
}

export interface AnthropicModelsResponse {
  data: AnthropicModel[];
}