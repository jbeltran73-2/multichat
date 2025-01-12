export const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';

export const MODEL_TYPES = {
  CHAT: ['Advanced']
} as const;

export const AVAILABLE_MODELS = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V3',
    type: MODEL_TYPES.CHAT
  }
];