import type { Message, ChatContext } from '../../../types/models';
import type { GeminiMessage, Part, TextPart, InputContent } from './types';

function buildSystemPrompt(context: ChatContext): string {
  const { userInfo } = context;
  let systemPrompt = context.systemPrompt || 'You are a helpful AI assistant. ';

  // Add user information to the context
  if (Object.keys(userInfo).length > 0) {
    systemPrompt += '\nHere is what I know about the user:\n';
    for (const [key, value] of Object.entries(userInfo)) {
      systemPrompt += `- User's ${key}: ${value}\n`;
    }
  }

  return systemPrompt;
}

export function formatMessages(
  message: string,
  context: ChatContext,
  previousMessages: Message[]
): InputContent[] {
  const formattedMessages: InputContent[] = [];

  // Add system message with context at the start of the conversation
  if (previousMessages.length === 0) {
    const systemPrompt = buildSystemPrompt(context);
    formattedMessages.push({
      role: 'user',
      parts: [{ text: systemPrompt } as TextPart]
    });

    // Add model's acknowledgment
    formattedMessages.push({
      role: 'model',
      parts: [{ text: 'I understand. I will remember this information about the user throughout our conversation.' } as TextPart]
    });
  }

  // Convert previous messages
  previousMessages.forEach(msg => {
    formattedMessages.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content } as TextPart]
    });
  });

  // Add new message
  formattedMessages.push({
    role: 'user',
    parts: [{ text: message } as TextPart]
  });

  return formattedMessages;
}