export const GROQ_API_URL = 'https://api.groq.com/openai/v1';

// Model type mapping based on model characteristics
export const MODEL_TYPE_MAPPING = {
  'llama3-groq': ['Advanced', 'Tool'],
  'llama-3.1': ['Advanced'],
  'llama-3.2': ['Advanced'],
  'llama-3.3': ['Advanced'],
  'mixtral': ['Advanced'],
  'gemma': ['Essential'],
  'whisper': ['Audio'],
  'llama-guard': ['Security']
} as const;

export const DEFAULT_MAX_TOKENS = 1024;
export const DEFAULT_TEMPERATURE = 0.7;
export const REQUEST_TIMEOUT = 30000; // 30 seconds