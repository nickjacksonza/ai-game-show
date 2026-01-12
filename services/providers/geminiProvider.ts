import {
  GoogleGenAI,
  Chat,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/genai';
import {
  ChatConfig,
  ChatSession,
  ChatMessage,
  ProviderAuthConfig,
} from '../../types';
import { AIProviderAdapter } from './types';

class GeminiChatSession implements ChatSession {
  private chat: Chat;
  private history: ChatMessage[] = [];

  constructor(client: GoogleGenAI, model: string, config: ChatConfig) {
    this.chat = client.chats.create({
      model,
      config: {
        systemInstruction: config.systemPrompt,
        maxOutputTokens: config.maxOutputTokens,
        temperature: config.temperature,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      },
    });
  }

  async sendMessage(message: string): Promise<string> {
    this.history.push({ role: 'user', content: message });

    try {
      const response = await this.chat.sendMessage({ message });

      let text =
        response.text ??
        response.candidates?.[0]?.content?.parts?.[0]?.text ??
        null;

      if (!text) {
        const finishReason = response.candidates?.[0]?.finishReason;
        text = finishReason
          ? `[System: Answer blocked (${finishReason})]`
          : "I'm speechless! (Empty response)";
      }

      this.history.push({ role: 'assistant', content: text });
      return text;
    } catch (error) {
      console.error('Gemini chat error:', error);
      return 'Err... *static noise* (Connection Error)';
    }
  }

  getHistory(): ChatMessage[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}

export const geminiProvider: AIProviderAdapter = {
  createSession(
    auth: ProviderAuthConfig,
    model: string,
    config: ChatConfig
  ): ChatSession {
    const client = new GoogleGenAI({
      apiKey: auth.apiKey || process.env.API_KEY || '',
    });
    return new GeminiChatSession(client, model, config);
  },
};
