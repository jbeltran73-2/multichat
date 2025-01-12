import type { AIModel, ModelType } from '../../../types/models';
import { AVAILABLE_MODELS } from './constants';
import { APIError } from '../../error/errorHandler';

function validateApiKey(apiKey: string): void {
  if (!apiKey) {
    throw new APIError('API key is required', 'Gemini');
  }

  // Check if API key follows Google's format (starts with "AIza")
  if (!apiKey.startsWith('AIza')) {
    throw new APIError('Invalid API key format. Gemini API keys should start with "AIza"', 'Gemini');
  }
}

function convertToModelType(type: readonly string[]): ModelType[] {
  return [...type] as ModelType[];
}

export async function fetchGeminiModels(apiKey: string): Promise<AIModel[]> {
  try {
    // Validate API key before returning models
    validateApiKey(apiKey);

    return AVAILABLE_MODELS.map(model => ({
      id: model.id,
      name: model.name,
      provider: 'gemini',
      type: convertToModelType(model.type),
      icon: '/provider-icons/gemini-logo.png',
      isConfigured: true
    }));
  } catch (error) {
    console.error('Error fetching Gemini models:', error);
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to fetch Gemini models',
      'Gemini'
    );
  }
}