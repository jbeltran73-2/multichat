import type { AIModel, ModelType } from '../../../types/models';
import { APIError } from '../../error/errorHandler';
import Groq from 'groq-sdk';

export async function fetchGroqModels(apiKey: string): Promise<AIModel[]> {
  try {
    const groq = new Groq({ 
      apiKey,
      dangerouslyAllowBrowser: true
    });
    
    // Verify API key by making a test request with a valid model
    await groq.chat.completions.create({
      messages: [{ role: 'system', content: 'test' }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
      max_tokens: 1
    });
    
    // Fetch available models
    const response = await groq.models.list();
    console.log('Groq models response:', response);

    // Filter out deprecated models and map to our format
    const models = response.data
      .filter(model => !model.id.toLowerCase().includes('deprecated'))
      .map(model => {
        let type: ModelType[] = ['Advanced'];
        if (model.id.includes('whisper')) {
          type = ['Audio'];
        } else if (model.id.includes('guard')) {
          type = ['Security'];
        }

        return {
          id: model.id,
          name: formatModelName(model.id),
          type,
          provider: 'groq',
          icon: '🚀',
          isConfigured: true
        };
      });

    console.log('Formatted Groq models:', models);
    return models;
  } catch (error) {
    console.error('Error fetching Groq models:', error);
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to get Groq models',
      'Groq'
    );
  }
}

function formatModelName(id: string): string {
  // Remove version numbers and clean up the name
  return id
    .split('-')
    .map(part => {
      if (part === 'v3') return 'V3';
      if (part === 'en') return 'EN';
      if (part === 'it') return 'Instruct';
      if (part.match(/^\d+b$/)) return `${part.replace('b', '')}B`;
      if (part.match(/^\d+x\d+b$/)) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}