import { describe, it, expect, vi } from 'vitest';
import { sendMessage } from '../client';
import type { ChatContext, Message } from '../../../../types/models';

describe('Anthropic Client', () => {
  const mockApiKey = 'test_api_key';
  const mockModelId = 'claude-3-5-sonnet-20241022';
  const mockContext: ChatContext = {
    systemPrompt: 'You are a helpful assistant',
    userInfo: {}
  };
  const mockPreviousMessages: Message[] = [];

  it('should successfully send a message and receive a response', async () => {
    // Mock the fetch response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 'msg_123',
        content: [{ type: 'text', text: 'Hello!' }],
        model: mockModelId,
        role: 'assistant'
      })
    });

    const response = await sendMessage(
      'Hello, Claude',
      mockApiKey,
      mockModelId,
      mockContext,
      mockPreviousMessages
    );

    expect(response).toBe('Hello!');
    expect(fetch).toHaveBeenCalledWith('/api/anthropic-chat', expect.any(Object));
  });

  it('should handle API errors gracefully', async () => {
    // Mock a failed API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({
        error: 'Invalid API key'
      })
    });

    await expect(
      sendMessage(
        'Hello, Claude',
        mockApiKey,
        mockModelId,
        mockContext,
        mockPreviousMessages
      )
    ).rejects.toThrow();
  });
});