import type { Message, ChatContext } from '../../../types/models';
import type { AnthropicMessage, AnthropicRole } from './types';

type MessageRole = 'user' | 'assistant' | 'system';

interface FormattedMessage {
  role: MessageRole;
  content: string;
}

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
): FormattedMessage[] {
  const formattedMessages: FormattedMessage[] = [];

  // Add system message with context
  const systemPrompt = buildSystemPrompt(context);
  formattedMessages.push({
    role: 'system',
    content: systemPrompt
  });

  // Convert previous messages
  const convertedMessages = previousMessages.map(msg => ({
    role: (msg.role === 'assistant' ? 'assistant' : 'user') as MessageRole,
    content: msg.content
  }));

  // Add previous messages
  formattedMessages.push(...convertedMessages);

  // Add new message
  formattedMessages.push({
    role: 'user',
    content: message
  });

  return formattedMessages;
}