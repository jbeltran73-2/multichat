export interface TextPart {
  text: string;
}

export interface InlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export type Part = TextPart | InlineDataPart;

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: Part[];
}

export interface InputContent {
  role: 'user' | 'model';
  parts: string | Part[];
}