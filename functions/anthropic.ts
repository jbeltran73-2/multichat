interface AnthropicError {
  error?: {
    type?: string;
    message?: string;
  };
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
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
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    try {
      const requestData = await request.json() as AnthropicRequest;
      const authHeader = request.headers.get('Authorization');

      if (!authHeader) {
        return new Response(JSON.stringify({ 
          error: 'Missing API key. Please ensure your Anthropic API key is properly configured.' 
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      // Extract API key from Authorization header
      const apiKey = authHeader.replace('Bearer ', '');

      // Forward the request to Anthropic's API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
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

      const data = await response.json() as AnthropicResponse | AnthropicError;

      // If Anthropic returns an error, format it nicely
      if (!response.ok) {
        let errorMessage = 'Failed to communicate with Anthropic API';
        const errorData = data as AnthropicError;
        if (errorData.error) {
          if (errorData.error.type === 'authentication_error') {
            errorMessage = 'Invalid API key. Please check your Anthropic API key configuration.';
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        }

        return new Response(JSON.stringify({ 
          error: errorMessage,
          details: errorData.error 
        }), {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      // Return the successful response
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 200,
      });
    } catch (error: any) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        details: error.stack
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};