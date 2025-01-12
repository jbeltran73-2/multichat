import type { Message, ChatContext } from '../../../types/models';
import type { GroqMessage } from './types';

export function formatMessages(
  message: string,
  context: ChatContext,
  previousMessages: Message[]
): GroqMessage[] {
  return [
    // Add system message if present
    ...(context.systemPrompt ? [{
      role: 'system',
      content: context.systemPrompt
    }] : []),
    // Add previous messages
    ...previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    // Add new message
    {
      role: 'user',
      content: message
    }
  ];
}