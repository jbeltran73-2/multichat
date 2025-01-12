// Copyright (c) 2025 Juan Beltrán
// Licensed under the MIT License. See LICENSE file for details.

import type { APIConfig, Message, ChatContext } from '../../types/models';
import { formatSystemMessages } from '../messageFormatters';

export async function sendOpenAIMessage(
  message: string,
  config: APIConfig,
  modelId: string,
  context: ChatContext,
  previousMessages: Message[]
): Promise<string> {
  const endpoint = config.endpoint || 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(endpoint, {
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
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI API Error: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response from OpenAI API');
  }

  return data.choices[0].message.content;
}