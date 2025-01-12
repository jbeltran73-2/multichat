import type { Message, ChatContext, AIModel } from '../../../types/models';
import { APIError } from '../../error/errorHandler';

interface CerebrasModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface CerebrasModelList {
  object: string;
  data: CerebrasModel[];
}

interface CerebrasResponse {
  id: string;
  choices: Array<{
    finish_reason: string;
    index: number;
    message: {
      content: string;
      role: string;
    };
  }>;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function getModels(apiKey: string): Promise<AIModel[]> {
  try {
    const response = await fetch('https://api.cerebras.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Cerebras models');
    }

    const modelList = await response.json() as CerebrasModelList;
    
    return modelList.data.map(model => ({
      id: model.id,
      name: `${model.id} (${model.owned_by})`,
      provider: "cerebras",
      type: ['Advanced'], // Default type for Cerebras models
      icon: '🧠', // Default icon for Cerebras
      isConfigured: true
    }));
  } catch (error) {
    console.error('Error fetching Cerebras models:', error);
    throw error;
  }
}

export async function sendMessage(
  message: string,
  apiKey: string,
  modelId: string,
  context: ChatContext,
  previousMessages: Message[]
): Promise<string> {
  try {
    const messages = previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add the new message
    messages.push({
      role: 'user',
      content: message
    });

    // Add system message if present
    if (context.systemPrompt) {
      messages.unshift({
        role: 'system',
        content: context.systemPrompt
      });
    }

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get response from Cerebras');
    }

    const data = await response.json() as CerebrasResponse;
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error:', error);
    if (error.message.includes('API key')) {
      throw new Error('Invalid or missing Cerebras API key');
    }
    throw new APIError(
      error.message || 'Failed to communicate with Cerebras API',
      'Cerebras'
    );
  }
}