import type { AIModel, ModelType } from '../../../types/models';
import { APIError } from '../../error/errorHandler';

export async function fetchDeepseekModels(apiKey: string): Promise<AIModel[]> {
  try {
    if (!apiKey) {
      throw new Error('Deepseek API key is required');
    }

    // Make a test request to verify the API key
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: 'test' }],
        max_tokens: 1
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
    }

    // Return the single supported model
    const models: AIModel[] = [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek V3',
        type: ['Advanced'] as ModelType[],
        provider: 'deepseek',
        icon: '🧠',
        isConfigured: true
      }
    ];

    return models;
  } catch (error) {
    console.error('Error fetching Deepseek models:', error);
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to get Deepseek models',
      'Deepseek'
    );
  }
}