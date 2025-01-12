import { AnthropicClient } from '../../../anthropic';
import type { Message, ChatContext } from '../../types/models';

export async function sendAnthropicMessage(
  message: string,
  apiKey: string,
  modelId: string,
  context: ChatContext,
  previousMessages: Message[]
): Promise<string> {
  const client = new AnthropicClient({ apiKey });

  const formattedMessages = [
    // Add system message if present
    ...(context.systemPrompt ? [{
      role: 'system' as const,
      content: context.systemPrompt
    }] : []),
    // Add previous messages
    ...previousMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    // Add new message
    {
      role: 'user' as const,
      content: message
    }
  ];

  return client.sendMessage(formattedMessages, modelId);
}