import { describe, it, expect } from 'vitest';
import { formatMessages } from '../messageFormatter';
import type { ChatContext, Message } from '../../../../types/models';

describe('Message Formatter', () => {
  const mockContext: ChatContext = {
    systemPrompt: 'You are a helpful assistant',
    userInfo: {}
  };

  it('should format messages correctly with system prompt', () => {
    const previousMessages: Message[] = [{
      id: '1',
      role: 'user',
      content: 'Previous message',
      timestamp: Date.now()
    }];

    const result = formatMessages('Hello', mockContext, previousMessages);

    expect(result).toEqual([
      { role: 'system', content: 'You are a helpful assistant' },
      { role: 'user', content: 'Previous message' },
      { role: 'user', content: 'Hello' }
    ]);
  });

  it('should format messages without system prompt', () => {
    const contextWithoutSystem: ChatContext = {
      systemPrompt: '',
      userInfo: {}
    };

    const result = formatMessages('Hello', contextWithoutSystem, []);

    expect(result).toEqual([
      { role: 'user', content: 'Hello' }
    ]);
  });
});