import type { APIConfig, Message, ChatContext } from '../../types/models';
import { formatSystemMessages } from '../messageFormatters';

export async function sendXaiMessage(
  message: string,
  config: APIConfig,
  modelId: string,
  context: ChatContext,
  previousMessages: Message[]
): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        ...formatSystemMessages(context),
        ...previousMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ],
      stream: false,
      temperature: 0
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `xAI API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}