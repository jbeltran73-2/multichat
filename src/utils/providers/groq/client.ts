import type { Message, ChatContext } from '../../../types/models';
import type { GroqConfig, GroqCompletionRequest, GroqCompletionResponse, GroqErrorResponse } from './types';
import { formatMessages } from './messageFormatter';
import { APIError } from '../../error/errorHandler';
import { GROQ_API_URL } from './constants';

export async function sendMessage(
  message: string,
  apiKey: string,
  modelId: string,
  context: ChatContext,
  previousMessages: Message[]
): Promise<string> {
  try {
    const config: GroqConfig = {
      apiKey,
      baseUrl: GROQ_API_URL
    };

    const formattedMessages = formatMessages(message, context, previousMessages);
    
    const requestData: GroqCompletionRequest = {
      model: modelId,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1024
    };

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json() as GroqErrorResponse;
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as GroqCompletionResponse;
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Groq');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to communicate with Groq',
      'Groq'
    );
  }
}