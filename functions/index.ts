import anthropicModels from './anthropic-models';
import anthropicChat from './anthropic-chat';

export interface Env {
  // No environment variables needed as we use user's API key
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests for all routes
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    
    try {
      // Route requests based on the path
      switch (url.pathname) {
        case '/api/anthropic-models':
          if (request.method !== 'GET') {
            return new Response(JSON.stringify({
              error: 'Method not allowed',
              message: 'Only GET requests are allowed for this endpoint',
              endpoint: url.pathname
            }), {
              status: 405,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              }
            });
          }
          return anthropicModels.fetch(request, env, ctx);
        
        case '/api/anthropic-chat':
          if (request.method !== 'POST') {
            return new Response(JSON.stringify({
              error: 'Method not allowed',
              message: 'Only POST requests are allowed for this endpoint',
              endpoint: url.pathname
            }), {
              status: 405,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              }
            });
          }
          return anthropicChat.fetch(request, env, ctx);
        
        default:
          return new Response(JSON.stringify({
            error: 'Not Found',
            message: `Endpoint ${url.pathname} does not exist`,
            availableEndpoints: ['/api/anthropic-models', '/api/anthropic-chat']
          }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          });
      }
    } catch (error: any) {
      console.error('Router error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        stack: error.stack,
        endpoint: url.pathname,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};