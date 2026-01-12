import OpenAI from 'openai';
import {
  ChatConfig,
  ChatSession,
  ChatMessage,
  ProviderAuthConfig,
} from '../../types';
import { AIProviderAdapter } from './types';

class OpenAIChatSession implements ChatSession {
  private client: OpenAI;
  private history: ChatMessage[] = [];
  private model: string;
  private systemPrompt: string;
  private maxTokens: number;
  private temperature: number;

  constructor(client: OpenAI, model: string, config: ChatConfig) {
    this.client = client;
    this.model = model;
    this.systemPrompt = config.systemPrompt;
    this.maxTokens = config.maxOutputTokens;
    this.temperature = config.temperature;
  }

  async sendMessage(message: string): Promise<string> {
    this.history.push({ role: 'user', content: message });

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.systemPrompt },
      ...this.history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const text = completion.choices[0]?.message?.content ?? '[No response]';
      this.history.push({ role: 'assistant', content: text });
      return text;
    } catch (error) {
      console.error('OpenAI chat error:', error);
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

export const openAIProvider: AIProviderAdapter = {
  createSession(
    auth: ProviderAuthConfig,
    model: string,
    config: ChatConfig
  ): ChatSession {
    const client = new OpenAI({
      apiKey: auth.apiKey,
      baseURL: auth.baseUrl || undefined,
      dangerouslyAllowBrowser: true,
    });
    return new OpenAIChatSession(client, model, config);
  },
};
