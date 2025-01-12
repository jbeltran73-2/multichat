import type { AIModel } from '../../types/models';

export async function fetchOpenAIModels(apiKey: string): Promise<AIModel[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.data
      .filter((model: any) => model.id.startsWith('gpt-'))
      .map((model: any) => ({
        id: model.id,
        name: formatModelName(model.id),
        provider: 'openai',
        type: determineModelType(model.id),
        icon: '🤖',
        isConfigured: true
      }));
  } catch (error) {
    console.warn('Error fetching OpenAI models:', error);
    // Fallback models
    return [
      {
        id: 'gpt-4-turbo-preview',
        name: 'GPT-4 Turbo',
        provider: 'openai',
        type: ['Advanced'],
        icon: '🤖',
        isConfigured: true
      },
      {
        id: 'gpt-4-vision-preview',
        name: 'GPT-4 Vision',
        provider: 'openai',
        type: ['Advanced', 'Vision'],
        icon: '🤖',
        isConfigured: true
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        type: ['Essential'],
        icon: '🤖',
        isConfigured: true
      }
    ];
  }
}

function formatModelName(id: string): string {
  return id
    .split(/[-/]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function determineModelType(modelId: string): ('Essential' | 'Advanced' | 'Vision')[] {
  const types: ('Essential' | 'Advanced' | 'Vision')[] = ['Essential'];
  
  if (modelId.includes('gpt-4')) {
    types.push('Advanced');
  }
  
  if (modelId.includes('vision')) {
    types.push('Vision');
  }
  
  return types;
}