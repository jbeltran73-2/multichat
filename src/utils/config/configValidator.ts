import type { APIConfig } from '../../types/models';

export function validateConfig(config: APIConfig): string | null {
  if (!config.provider) {
    return 'Provider is required';
  }

  if (!config.apiKey) {
    return 'API key is required';
  }

  if (needsEndpoint(config.provider) && !config.endpoint) {
    return `Endpoint URL is required for ${config.provider}`;
  }

  return null;
}

export function needsEndpoint(provider: string): boolean {
  return ['ollama'].includes(provider.toLowerCase());
}

export function getDefaultEndpoint(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'ollama':
      return 'http://localhost:11434';
    case 'xai':
      return 'https://ai.xai.com';
    default:
      return '';
  }
}