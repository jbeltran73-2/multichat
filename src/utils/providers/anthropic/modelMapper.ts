import type { AIModel, ModelType } from '../../../types/models';
import type { AnthropicModel } from './types';
import { MODEL_TYPES } from './constants';

export function mapAnthropicModel(model: AnthropicModel): AIModel {
  const types = determineModelTypes(model.id);
  
  return {
    id: model.id,
    name: model.display_name || formatModelName(model.id),
    provider: 'anthropic',
    type: types,
    icon: '🧠',
    isConfigured: true
  };
}

function determineModelTypes(modelId: string): ModelType[] {
  const types: ModelType[] = [];
  
  if (modelId.includes('opus')) {
    types.push('Advanced');
  } else if (modelId.includes('sonnet')) {
    types.push('Essential');
  } else if (modelId.includes('haiku')) {
    types.push('Essential');
  }

  // Add Essential type for Claude 3.x models
  if (modelId.includes('claude-3') && !types.includes('Essential')) {
    types.push('Essential');
  }
  
  // Ensure at least one type is set
  if (types.length === 0) {
    types.push('Essential'); // Default to Essential
  }
  
  return types;
}

function formatModelName(modelId: string): string {
  // Handle specific model IDs
  if (modelId === 'claude-3-5-sonnet-20241022') {
    return 'Claude 3.5 Sonnet (New)';
  }
  if (modelId === 'claude-3-5-sonnet-20240620') {
    return 'Claude 3.5 Sonnet (Old)';
  }

  // Format other model names
  return modelId
    .split('-')
    .map(part => {
      if (part === 'v2') return 'V2';
      if (part === 'v3') return 'V3';
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}