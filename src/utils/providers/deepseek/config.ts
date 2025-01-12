import OpenAI from 'openai';

// Using the main API URL as recommended
export const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export const MODEL_TYPES = {
  CHAT: ['Advanced'],
  CODE: ['Code']
} as const;

export const DEFAULT_CONFIG = {
  temperature: 0.7,
  maxTokens: 1024
};

export function createDeepseekClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: DEEPSEEK_BASE_URL,
    dangerouslyAllowBrowser: true
  });
}