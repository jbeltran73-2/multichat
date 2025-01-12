import type { ChatContext, Message } from '../types/models';

const SYSTEM_MODEL_ID = 'system';

export function formatSystemMessages(context: ChatContext): Message[] {
  const messages: Message[] = [
    {
      role: 'system',
      content: context.systemPrompt,
      id: 'system-prompt',
      timestamp: Date.now(),
      modelId: SYSTEM_MODEL_ID
    }
  ];

  if (Object.keys(context.userInfo).length > 0) {
    messages.push({
      role: 'system',
      content: `User information:\n${
        Object.entries(context.userInfo)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      }`,
      id: 'system-user-info',
      timestamp: Date.now(),
      modelId: SYSTEM_MODEL_ID
    });
  }

  return messages;
}