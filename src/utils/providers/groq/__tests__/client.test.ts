import { describe, it, expect, vi } from 'vitest';
import { sendMessage } from '../client';
import type { ChatContext, Message } from '../../../../types/models';

describe('Groq Client', () => {
  const mockApiKey = 'test_api_key';
  const mockModelId = 'llama3-8b-8192';
  const mockContext: ChatContext = {
    systemPrompt: 'You are a helpful assistant',
    userInfo: {}
  };
  const mockPreviousMessages: Message[] = [];

  it('should successfully send a message and receive a response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: 'Hello!'
          }
        }]
      })
    });

    const response = await sendMessage(
      'Hello',
      mockApiKey,
      mockModelId,
      mockContext,
      mockPreviousMessages
    );

    expect(response).toBe('Hello!');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat/completions'),
      expect.any(Object)
    );
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({
        error: {
          message: 'Invalid API key'
        }
      })
    });

    await expect(
      sendMessage(
        'Hello',
        mockApiKey,
        mockModelId,
        mockContext,
        mockPreviousMessages
      )
    ).rejects.toThrow();
  });
});