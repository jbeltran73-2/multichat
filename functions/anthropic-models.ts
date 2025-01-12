interface AnthropicModel {
  type: string;
  id: string;
  display_name?: string;
  created_at: string;
}

interface AnthropicModelsResponse {
  data: AnthropicModel[];
  has_more: boolean;
  first_id?: string;
  last_id?: string;
}

interface AnthropicError {
  error?: {
    type?: string;
    message?: string;
  };
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
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    try {
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

      // Fetch models from Anthropic's API
      const response = await fetch('https://api.anthropic.com/v1/models', {
        method: 'GET',
        headers: {
          'anthropic-api-key': apiKey,
          'anthropic-version': '2024-02-15'
        }
      });

      const data = await response.json() as AnthropicModelsResponse | AnthropicError;

      // If Anthropic returns an error, format it nicely
      if (!response.ok) {
        const errorData = data as AnthropicError;
        let errorMessage = 'Failed to fetch Anthropic models';
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
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

      const modelsData = data as AnthropicModelsResponse;

      // Return the successful response
      return new Response(JSON.stringify(modelsData), {
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