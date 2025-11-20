export enum GeminiModel {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
  FLASH_LITE = 'gemini-flash-lite-latest',
}

export interface Persona {
  id: string;
  name: string;
  avatar: string; // Emoji or URL
  color: string; // Tailwind color class part (e.g., 'blue', 'red')
  systemInstruction: string;
}

export interface Contestant {
  id: string;
  persona: Persona;
  selectedModel: GeminiModel;
  currentAnswer: string;
  isThinking: boolean;
  score: number;
  apiKey?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}