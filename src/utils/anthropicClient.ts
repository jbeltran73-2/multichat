import Anthropic from '@anthropic-ai/sdk';
import type { Message } from '../types/models';

export const createAnthropicClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error('Anthropic API key is required');
  }
  
  return new Anthropic({
    apiKey,
    // @ts-ignore dangerouslyAllowBrowser is available but not in types
    dangerouslyAllowBrowser: true
  });
};

export const formatMessagesForAnthropic = (messages: Message[]) => {
  return messages.map(msg => ({
    role: msg.role === 'system' ? 'assistant' : msg.role,
    content: msg.content
  }));
};

export const createAnthropicSystemPrompt = (messages: Message[]) => {
  const systemMessages = messages.filter(msg => msg.role === 'system');
  if (systemMessages.length === 0) {
    return 'You are a helpful AI assistant.';
  }
  return systemMessages.map(msg => msg.content).join('\n\n');
};