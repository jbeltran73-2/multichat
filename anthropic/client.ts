import type { AnthropicConfig, AnthropicMessage, AnthropicResponse } from './types';
import { DEFAULT_CONFIG } from './config';
import { APIError } from '../src/utils/error/errorHandler';

export class AnthropicClient {
  private config: Required<AnthropicConfig>;

  constructor(config: AnthropicConfig) {
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || DEFAULT_CONFIG.baseUrl,
      version: config.version || DEFAULT_CONFIG.version
    };
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': this.config.version,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new APIError(
        error.error?.message || `Request failed with status ${response.status}`,
        'Anthropic',
        response.status
      );
    }

    return response.json();
  }

  async sendMessage(messages: AnthropicMessage[], modelId: string): Promise<string> {
    try {
      const response = await this.request<AnthropicResponse>('/messages', {
        method: 'POST',
        body: JSON.stringify({
          model: modelId,
          max_tokens: DEFAULT_CONFIG.maxTokens,
          messages
        })
      });

      if (!response.content?.[0]?.text) {
        throw new APIError('Invalid response format', 'Anthropic');
      }

      return response.content[0].text;
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(
        error instanceof Error ? error.message : 'Unknown error',
        'Anthropic'
      );
    }
  }
}