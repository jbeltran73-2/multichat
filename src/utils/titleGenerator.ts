import type { Message } from '../types/models';

export function generateTitle(messages: Message[]): string {
  if (messages.length === 0) return 'New Chat';
  
  // Get the first user message
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Chat';
  
  // Use the first 30 characters of the message as the title
  const title = firstUserMessage.content.slice(0, 30).trim();
  return title + (firstUserMessage.content.length > 30 ? '...' : '');
}