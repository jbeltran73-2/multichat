import type { AIModel } from '../../../types/models';
import type { AnthropicModelsResponse } from './types';
import { ANTHROPIC_API_VERSION, FALLBACK_MODELS } from './constants';
import { mapAnthropicModel } from './modelMapper';
import { APIError } from '../../error/errorHandler';

export async function fetchAnthropicModels(apiKey: string): Promise<AIModel[]> {
  try {
    const response = await fetch('https://pildoria.pages.dev/api/anthropic-models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new APIError(
        errorData.error?.message || response.statusText,
        'Anthropic',
        response.status
      );
    }

    const data = await response.text(); // First get the raw text
    if (!data) {
      throw new Error('Empty response from server');
    }

    const parsedData: AnthropicModelsResponse = JSON.parse(data); // Then parse it
    
    return parsedData.data
      .filter(model => model.id.startsWith('claude-'))
      .map(mapAnthropicModel)
      .sort((a, b) => {
        const versionA = getVersionWeight(a.id);
        const versionB = getVersionWeight(b.id);
        if (versionA !== versionB) return versionB - versionA;
        
        return getModelTypeWeight(a.id) - getModelTypeWeight(b.id);
      });
  } catch (error) {
    console.warn('Error fetching Anthropic models:', error);
    // Use fallback models if API fails
    return FALLBACK_MODELS.map(mapAnthropicModel);
  }
}

function getVersionWeight(modelId: string): number {
  if (modelId.includes('3.5')) return 35;
  if (modelId.includes('3')) return 30;
  return 0;
}

function getModelTypeWeight(modelId: string): number {
  if (modelId.includes('opus')) return 3;
  if (modelId.includes('sonnet')) return 2;
  if (modelId.includes('haiku')) return 1;
  return 0;
}