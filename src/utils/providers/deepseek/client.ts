import type { Message, ChatContext, APIConfig } from '../../../types/models';
import { formatMessages } from './messageFormatter';
import { APIError } from '../../error/errorHandler';
import { DEEPSEEK_API_URL } from './constants';

export async function sendMessage(
  message: string,
  config: APIConfig,
  modelId: string,
  context: ChatContext,
  previousMessages: Message[]
): Promise<string> {
  try {
    if (!config?.apiKey) {
      throw new Error('Deepseek API key is required');
    }

    // Format messages
    const formattedMessages = formatMessages(message, context, previousMessages);

    // Make direct fetch request to Deepseek API
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.95,
        presence_penalty: 0.0,
        frequency_penalty: 0.0,
        stop: null
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (error.error?.message?.includes('API key')) {
        throw new Error('Invalid or missing Deepseek API key');
      }
      throw new Error(error.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Deepseek');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Deepseek API Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Deepseek API key is required');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Could not connect to Deepseek API. Please check your internet connection.');
      }
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to communicate with Deepseek',
      'Deepseek'
    );
  }
}