import {
  ChatConfig,
  ChatSession,
  ChatMessage,
  ProviderAuthConfig,
} from '../../types';
import { AIProviderAdapter } from './types';

const DEFAULT_OLLAMA_URL = 'http://localhost:11434';

class OllamaChatSession implements ChatSession {
  private history: ChatMessage[] = [];
  private baseUrl: string;
  private model: string;
  private systemPrompt: string;
  private maxTokens: number;
  private temperature: number;

  constructor(auth: ProviderAuthConfig, model: string, config: ChatConfig) {
    this.baseUrl = auth.baseUrl || DEFAULT_OLLAMA_URL;
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
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
          options: {
            num_predict: this.maxTokens,
            temperature: this.temperature,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.message?.content ?? '[No response]';

      this.history.push({ role: 'assistant', content: text });
      return text;
    } catch (error) {
      console.error('Ollama chat error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Connection Error';
      if (errorMessage.includes('Failed to fetch')) {
        return 'Err... *static noise* (Ollama not running - start with `ollama serve`)';
      }
      return `Err... *static noise* (${errorMessage})`;
    }
  }

  getHistory(): ChatMessage[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}

export const ollamaProvider: AIProviderAdapter = {
  createSession(
    auth: ProviderAuthConfig,
    model: string,
    config: ChatConfig
  ): ChatSession {
    return new OllamaChatSession(auth, model, config);
  },
};
