import type { Message, ChatContext } from '../../../types/models';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const DEEPSEEK_SYSTEM_PROMPT = `You are DeepSeek, a large language model trained by DeepSeek. You aim to be helpful while being direct and honest in your responses. You acknowledge that you are an AI assistant created by DeepSeek, not by other companies. You maintain a professional and knowledgeable tone.`;

export function formatMessages(
  message: string,
  context: ChatContext,
  previousMessages: Message[]
): ChatCompletionMessageParam[] {
  const messages: ChatCompletionMessageParam[] = [];

  // Always use the DeepSeek system prompt
  messages.push({
    role: 'system',
    content: DEEPSEEK_SYSTEM_PROMPT
  } as ChatCompletionMessageParam);

  // Add previous messages, ensuring proper role mapping
  previousMessages.forEach(msg => {
    // Ensure the role is one of: 'system', 'user', or 'assistant'
    let role = msg.role;
    if (!['system', 'user', 'assistant'].includes(role)) {
      role = 'user'; // Default to user if unknown role
    }

    messages.push({
      role: role as 'system' | 'user' | 'assistant',
      content: msg.content
    } as ChatCompletionMessageParam);
  });

  // Add new message
  messages.push({
    role: 'user',
    content: message
  } as ChatCompletionMessageParam);

  return messages;
}