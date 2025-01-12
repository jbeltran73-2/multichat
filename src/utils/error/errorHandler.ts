export class APIError extends Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown, provider: string): string {
  if (error instanceof APIError) {
    return `${provider} API Error: ${error.message}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return `Unknown error occurred while communicating with ${provider}`;
}