// Copyright (c) 2025 Juan Beltrán
// Licensed under the MIT License. See LICENSE file for details.

import type { APIConfig, Message, ChatContext } from '../types/models';
import { sendMessage as sendAnthropicMessage } from './providers/anthropic/client';
import { sendXaiMessage } from './providers/xai';
import { sendOpenAIMessage } from './providers/openai';
import { sendMessage as sendGroqMessage } from './providers/groq/client';
import { sendMessage as sendGeminiMessage } from './providers/gemini/client';
import { sendMessage as sendDeepseekMessage } from './providers/deepseek/client';
import { sendMessage as sendCerebrasMessage } from './providers/cerebras/client';

export async function sendMessage(
  message: string, 
  config: APIConfig, 
  modelId: string,
  context: ChatContext,
  previousMessages: Message[],
  fileData?: { mime_type: string; data: string }
): Promise<string> {
  if (!config?.apiKey) {
    throw new Error(
      "API key is required. Please configure your API key in the settings."
    );
  }

  if (!modelId) {
    throw new Error(
      "Model ID is required. Please select a model before sending messages."
    );
  }

  try {
    switch (config.provider) {
      case "anthropic":
        return await sendAnthropicMessage(
          message,
          config.apiKey,
          modelId,
          context,
          previousMessages
        );
      case "xai":
        return await sendXaiMessage(
          message,
          config,
          modelId,
          context,
          previousMessages
        );
      case "groq":
        return await sendGroqMessage(
          message,
          config.apiKey,
          modelId,
          context,
          previousMessages
        );
      case "gemini":
        return await sendGeminiMessage(
          message,
          config.apiKey,
          modelId,
          context,
          previousMessages,
          fileData
        );
      case "openai":
        return await sendOpenAIMessage(
          message,
          config,
          modelId,
          context,
          previousMessages
        );
      case "deepseek":
        return await sendDeepseekMessage(
          message,
          config,
          modelId,
          context,
          previousMessages
        );
      case "cerebras":
        return await sendCerebrasMessage(
          message,
          config.apiKey,
          modelId,
          context,
          previousMessages
        );
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    throw error instanceof Error
      ? error
      : new Error(
          `Failed to communicate with ${config.provider.toUpperCase()} API`
        );
  }
}