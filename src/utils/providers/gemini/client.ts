import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Message, ChatContext } from '../../../types/models';
import { formatMessages } from './messageFormatter';
import { APIError } from '../../error/errorHandler';
import type { Part, InputContent } from './types';

interface FileData {
  mime_type: string;
  data: string;
}

function validateApiKey(apiKey: string): void {
  if (!apiKey) {
    throw new APIError('API key is required', 'Gemini');
  }

  // Check if API key follows Google's format (starts with "AIza")
  if (!apiKey.startsWith('AIza')) {
    throw new APIError('Invalid API key format. Gemini API keys should start with "AIza"', 'Gemini');
  }
}

export async function sendMessage(
  message: string,
  apiKey: string,
  modelId: string,
  context: ChatContext,
  previousMessages: Message[],
  file?: FileData
): Promise<string> {
  try {
    // Validate API key before making the request
    validateApiKey(apiKey);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });

    // Format messages with context
    const formattedMessages = formatMessages(message, context, previousMessages);

    // Create chat with history
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1), // All messages except the last one
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    // Get the last message and its parts
    const lastMessage = formattedMessages[formattedMessages.length - 1];
    const parts: Part[] = [...(lastMessage.parts as Part[])];

    // Add file if present
    if (file) {
      parts.push({
        inlineData: {
          mimeType: file.mime_type,
          data: file.data,
        }
      });
    }

    // Send the message
    const result = await chat.sendMessage(parts);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);

    // Handle specific Google API errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('api key not valid') || errorMessage.includes('api_key_invalid')) {
        throw new APIError(
          'Invalid API key. Please make sure you\'re using a valid Gemini API key from Google AI Studio.',
          'Gemini'
        );
      }

      if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        throw new APIError(
          'API key does not have permission to access this model. Please check your API key permissions.',
          'Gemini'
        );
      }

      if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        throw new APIError(
          'API quota exceeded or rate limit reached. Please try again later.',
          'Gemini'
        );
      }
    }

    // Generic error
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to communicate with Gemini',
      'Gemini'
    );
  }
}