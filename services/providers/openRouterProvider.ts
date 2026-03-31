import {
  ChatConfig,
  ChatSession,
  ChatMessage,
  ProviderAuthConfig,
} from '../../types';
import { AIProviderAdapter } from './types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

class OpenRouterChatSession implements ChatSession {
  private history: ChatMessage[] = [];
  private systemPrompt: string;
  private model: string;
  private apiKey: string;
  private maxTokens: number;
  private temperature: number;

  constructor(auth: ProviderAuthConfig, model: string, config: ChatConfig) {
    this.apiKey = auth.apiKey || '';
    this.model = model;
    this.systemPrompt = config.systemPrompt;
    this.maxTokens = config.maxOutputTokens;
    this.temperature = config.temperature;
  }

  async sendMessage(message: string): Promise<string> {
    this.history.push({ role: 'user', content: message });

    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.history.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'AI Game Show',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
        );
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content ?? '[No response]';

      this.history.push({ role: 'assistant', content: text });
      return text;
    } catch (error) {
      console.error('OpenRouter chat error:', error);
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

export const openRouterProvider: AIProviderAdapter = {
  createSession(
    auth: ProviderAuthConfig,
    model: string,
    config: ChatConfig
  ): ChatSession {
    return new OpenRouterChatSession(auth, model, config);
  },
};
