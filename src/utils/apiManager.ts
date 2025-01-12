import type { AIModel, APIConfig } from '../types/models';
import { fetchAnthropicModels } from './providers/anthropic/models';
import { fetchOpenAIModels } from './providers/openaiModels';
import { fetchXAIModels } from './providers/xaiModels';
import { fetchGroqModels } from './providers/groq/models';
import { fetchGeminiModels } from './providers/gemini/models';
import { fetchDeepseekModels } from './providers/deepseek/models';
import { getModels as fetchCerebrasModels } from './providers/cerebras/client';

export async function fetchModels(config: APIConfig): Promise<AIModel[]> {
  if (!config?.apiKey) {
    throw new Error(`API key is required for ${config.provider.toUpperCase()}`);
  }

  try {
    switch (config.provider) {
      case 'anthropic':
        return await fetchAnthropicModels(config.apiKey);
      case 'openai':
        return await fetchOpenAIModels(config.apiKey);
      case 'xai':
        return await fetchXAIModels(config.apiKey);
      case 'groq':
        return await fetchGroqModels(config.apiKey);
      case 'gemini':
        return await fetchGeminiModels(config.apiKey);
      case 'deepseek':
        return await fetchDeepseekModels(config.apiKey);
      case 'cerebras':
        return await fetchCerebrasModels(config.apiKey);
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  } catch (error) {
    console.warn(`Error fetching models for ${config.provider}:`, error);
    throw error;
  }
}