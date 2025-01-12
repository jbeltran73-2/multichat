export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1';

export const MODEL_TYPES = {
  FLASH: ['Advanced', 'Fast'],
  PRO: ['Advanced', 'Professional'],
  EXPERIMENTAL: ['Experimental']
} as const;

export const AVAILABLE_MODELS = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    type: MODEL_TYPES.FLASH
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Gemini 1.5 Flash 8B',
    type: MODEL_TYPES.FLASH
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    type: MODEL_TYPES.PRO
  },
  {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    type: [...MODEL_TYPES.PRO, 'Vision']
  }
];