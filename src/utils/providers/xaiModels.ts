import type { AIModel } from '../../types/models';

export async function fetchXAIModels(apiKey: string): Promise<AIModel[]> {
  try {
    const response = await fetch('https://api.x.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`xAI API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.models.map((model: any) => ({
      id: model.id,
      name: model.name || formatModelName(model.id),
      provider: 'xai',
      type: ['Advanced'],
      icon: '🤖',
      isConfigured: true
    }));
  } catch (error) {
    console.warn('Error fetching xAI models:', error);
    // Fallback models
    return [
      {
        id: 'grok-beta',
        name: 'Grok Beta',
        provider: 'xai',
        type: ['Advanced'],
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