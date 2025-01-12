export const ANTHROPIC_API_VERSION = '2024-02-15';
export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1';

export const MODEL_TYPES = {
  OPUS: 'Advanced',
  SONNET: 'Essential',
  HAIKU: 'Basic'
} as const;

// Fallback models in case API fails
export const FALLBACK_MODELS = [
  {
    type: 'model',
    id: 'claude-3-5-sonnet-20241022',
    display_name: 'Claude 3.5 Sonnet (New)',
    created_at: '2024-10-22T00:00:00Z'
  },
  {
    type: 'model',
    id: 'claude-3-5-haiku-20241022',
    display_name: 'Claude 3.5 Haiku',
    created_at: '2024-10-22T00:00:00Z'
  },
  {
    type: 'model',
    id: 'claude-3-5-sonnet-20240620',
    display_name: 'Claude 3.5 Sonnet (Old)',
    created_at: '2024-06-20T00:00:00Z'
  },
  {
    type: 'model',
    id: 'claude-3-haiku-20240307',
    display_name: 'Claude 3 Haiku',
    created_at: '2024-03-07T00:00:00Z'
  },
  {
    type: 'model',
    id: 'claude-3-opus-20240229',
    display_name: 'Claude 3 Opus',
    created_at: '2024-02-29T00:00:00Z'
  },
  {
    type: 'model',
    id: 'claude-3-sonnet-20240229',
    display_name: 'Claude 3 Sonnet',
    created_at: '2024-02-29T00:00:00Z'
  },
  {
    type: 'model',
    id: 'claude-2.1',
    display_name: 'Claude 2.1',
    created_at: '2023-11-21T00:00:00Z'
  },
  {
    type: 'model',
    id: 'claude-2.0',
    display_name: 'Claude 2.0',
    created_at: '2023-07-11T00:00:00Z'
  }
];