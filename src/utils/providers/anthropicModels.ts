import type { AIModel } from '../../types/models';
import { ANTHROPIC_API_VERSION, FALLBACK_MODELS } from './anthropic/constants';

export async function fetchAnthropicModels(apiKey: string): Promise<AIModel[]> {
  if (!apiKey) {
    throw new Error('Anthropic API key is required');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_API_VERSION,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Anthropic API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.data
      .filter((model: any) => model.id.startsWith('claude-'))
      .map((model: any) => ({
        id: model.id,
        name: model.display_name || formatModelName(model.id),
        provider: 'anthropic',
        type: determineModelType(model.id),
        icon: '🧠',
        isConfigured: true
      }));
  } catch (error) {
    console.warn('Error fetching Anthropic models:', error);
    // Use fallback models if API fails
    return FALLBACK_MODELS.map(model => ({
      id: model.id,
      name: model.display_name,
      provider: 'anthropic',
      type: determineModelType(model.id),
      icon: '🧠',
      isConfigured: true
    }));
  }
}

function formatModelName(id: string): string {
  return id
    .split(/[-/]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function determineModelType(modelId: string): string[] {
  const types: string[] = [];
  
  if (modelId.includes('opus')) {
    types.push('Advanced');
  } else if (modelId.includes('sonnet')) {
    types.push('Essential');
  } else if (modelId.includes('haiku')) {
    types.push('Basic');
  }

  // Add Advanced type for Claude 3.x models
  if (modelId.includes('claude-3')) {
    types.push('Advanced');
  }
  
  return types;
}