import type { Message, ChatContext } from '../../../types/models';
import { formatMessages } from './messageFormatter';
import { APIError } from '../../error/errorHandler';
import { ANTHROPIC_API_VERSION } from './constants';

interface AnthropicResponse {
  id: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  role: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface ErrorResponse {
  error: string | {
    message: string;
    [key: string]: any;
  };
}

export async function sendMessage(
  message: string,
  apiKey: string,
  modelId: string,
  context: ChatContext,
  previousMessages: Message[]
): Promise<string> {
  try {
    // Format messages for Anthropic's API
    const formattedMessages = formatMessages(message, context, previousMessages);

    // Make the API request through our Cloudflare Worker
    const response = await fetch('https://pildoria.pages.dev/api/anthropic-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 4096,
        messages: formattedMessages,
        system: context.systemPrompt || undefined
      })
    });

    // First check if response is ok
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json() as ErrorResponse;
        if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' 
            ? errorData.error 
            : errorData.error.message || errorMessage;
        }
      } catch (parseError: any) {
        // If we can't parse the error response, add that info to the error message
        errorMessage += ` (Failed to parse error response: ${parseError.message})`;
      }
      throw new Error(errorMessage);
    }

    // Try to parse the successful response
    let responseText;
    try {
      responseText = await response.text();
      if (!responseText) {
        throw new Error('Empty response from server');
      }
    } catch (parseError: any) {
      throw new Error(`Failed to read response: ${parseError.message}`);
    }

    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText) as AnthropicResponse;
    } catch (parseError: any) {
      throw new Error(`Failed to parse JSON response: ${parseError.message}\nResponse text: ${responseText}`);
    }

    // Validate response structure
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new Error(`Invalid response structure: Missing content array\nResponse: ${JSON.stringify(data)}`);
    }

    if (!data.content[0]?.text) {
      throw new Error(`Invalid response structure: Missing text in first content item\nResponse: ${JSON.stringify(data)}`);
    }

    return data.content[0].text;
  } catch (error: any) {
    console.error('Anthropic API Error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    // Categorize errors for better error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Failed to connect to Anthropic API. Please check your internet connection.');
    }
    if (error.message.includes('405')) {
      throw new Error('API Configuration Error: The API endpoint is not properly configured (Method Not Allowed).');
    }
    if (error.message.includes('401')) {
      throw new Error('Authentication Error: Invalid or expired API key.');
    }
    if (error.message.includes('429')) {
      throw new Error('Rate Limit Error: Too many requests. Please try again later.');
    }
    if (error.message.includes('500')) {
      throw new Error('Server Error: Anthropic API is experiencing issues. Please try again later.');
    }
    if (error.message.includes('parse JSON')) {
      throw new Error('Response Format Error: Received invalid response from server. Please try again.');
    }
    
    // If it's already an APIError, rethrow it
    if (error instanceof APIError) {
      throw error;
    }
    
    // For any other errors, wrap in APIError with detailed message
    throw new APIError(
      `Anthropic API Error: ${error.message}`,
      'Anthropic'
    );
  }
}