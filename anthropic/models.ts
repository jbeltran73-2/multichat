import type { AIModel } from '../src/types/models';
import type { AnthropicConfig, AnthropicModelsResponse } from './types';
import { AnthropicClient } from './client';
import { DEFAULT_CONFIG } from './config';

const MODEL_TYPES = {
  OPUS: 'Advanced',
  SONNET: 'Essential',
  HAIKU: 'Basic'
} as const;

export async function getModels(config: AnthropicConfig): Promise<AIModel[]> {
  const client = new AnthropicClient(config);

  try {
    const response = await fetch(`${DEFAULT_CONFIG.baseUrl}/models`, {
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': DEFAULT_CONFIG.version
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data: AnthropicModelsResponse = await response.json();
    
    return data.data
      .filter(model => model.id.startsWith('claude-'))
      .map(model => ({
        id: model.id,
        name: model.display_name,
        provider: 'anthropic',
        type: determineModelTypes(model.id),
        icon: '🧠',
        isConfigured: true
      }))
      .sort((a, b) => b.name.localeCompare(a.name));
  } catch (error) {
    console.error('Error fetching Anthropic models:', error);
    throw error;
  }
}

function determineModelTypes(modelId: string): string[] {
  const types: string[] = [];
  
  if (modelId.includes('opus')) {
    types.push(MODEL_TYPES.OPUS);
  } else if (modelId.includes('sonnet')) {
    types.push(MODEL_TYPES.SONNET);
  } else if (modelId.includes('haiku')) {
    types.push(MODEL_TYPES.HAIKU);
  }

  if (modelId.includes('claude-3')) {
    types.push(MODEL_TYPES.OPUS);
  }
  
  return types;
}