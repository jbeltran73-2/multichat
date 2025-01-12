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

interface AnthropicError {
  error?: {
    type?: string;
    message?: string;
  };
}

interface AnthropicMessage {
  role: string;
  content: string;
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  system?: string;
}

export interface Env {
  // No environment variables needed as we use user's API key
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Helper function to create error responses
    const createErrorResponse = (status: number, message: string, details?: any) => {
      return new Response(
        JSON.stringify({
          error: message,
          details,
          timestamp: new Date().toISOString(),
          endpoint: 'anthropic-chat'
        }),
        {
          status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return createErrorResponse(405, 'Method not allowed. Only POST requests are accepted.');
    }

    try {
      // Parse request body
      let requestData: AnthropicRequest;
      try {
        requestData = await request.json() as AnthropicRequest;
      } catch (error: any) {
        return createErrorResponse(400, 'Invalid JSON in request body', { parseError: error.message });
      }

      // Validate request data
      if (!requestData.model || !requestData.messages) {
        return createErrorResponse(400, 'Missing required fields', { 
          required: ['model', 'messages'],
          received: Object.keys(requestData)
        });
      }

      const authHeader = request.headers.get('Authorization');
      if (!authHeader) {
        return createErrorResponse(401, 'Missing API key. Please ensure your Anthropic API key is properly configured.');
      }

      // Extract API key from Authorization header
      const apiKey = authHeader.replace('Bearer ', '');

      // Forward the request to Anthropic's API
      let response;
      try {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'anthropic-api-key': apiKey,
            'anthropic-version': '2024-02-15'
          },
          body: JSON.stringify({
            model: requestData.model,
            max_tokens: requestData.max_tokens,
            messages: requestData.messages,
            system: requestData.system
          })
        });
      } catch (error: any) {
        return createErrorResponse(500, 'Failed to connect to Anthropic API', { 
          networkError: error.message 
        });
      }

      // Parse Anthropic's response
      let data: AnthropicResponse | AnthropicError;
      try {
        data = await response.json();
      } catch (error: any) {
        return createErrorResponse(502, 'Invalid response from Anthropic API', { 
          parseError: error.message 
        });
      }

      // Handle Anthropic API errors
      if (!response.ok) {
        const errorData = data as AnthropicError;
        return createErrorResponse(response.status, 'Anthropic API Error', {
          anthropicError: errorData.error,
          statusCode: response.status,
          statusText: response.statusText
        });
      }

      // Validate response structure
      const responseData = data as AnthropicResponse;
      if (!responseData.content?.[0]?.text) {
        return createErrorResponse(502, 'Invalid response structure from Anthropic API', { 
          response: responseData 
        });
      }

      // Return the successful response
      return new Response(JSON.stringify(responseData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 200,
      });
    } catch (error: any) {
      console.error('Worker error:', error);
      return createErrorResponse(500, 'Internal server error', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  },
};