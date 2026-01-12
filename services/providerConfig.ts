import { AIProvider } from '../types';

// Provider-level configuration (API keys stored here, not per-contestant)
export interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  isConfigured: boolean;
  isConnected: boolean;
  availableModels: string[];
}

export interface ProviderConfigs {
  [AIProvider.GEMINI]: ProviderConfig;
  [AIProvider.OPENROUTER]: ProviderConfig;
  [AIProvider.OPENAI]: ProviderConfig;
  [AIProvider.OLLAMA]: ProviderConfig;
}

const STORAGE_KEY = 'ai-game-show-providers';

// Default provider configurations
export const DEFAULT_PROVIDER_CONFIGS: ProviderConfigs = {
  [AIProvider.GEMINI]: {
    provider: AIProvider.GEMINI,
    apiKey: '',
    isConfigured: false,
    isConnected: false,
    availableModels: ['gemini-2.5-flash', 'gemini-3-pro-preview', 'gemini-flash-lite-latest'],
  },
  [AIProvider.OPENROUTER]: {
    provider: AIProvider.OPENROUTER,
    apiKey: '',
    isConfigured: false,
    isConnected: false,
    availableModels: ['anthropic/claude-3.5-sonnet', 'anthropic/claude-3-haiku', 'anthropic/claude-3-opus'],
  },
  [AIProvider.OPENAI]: {
    provider: AIProvider.OPENAI,
    apiKey: '',
    isConfigured: false,
    isConnected: false,
    availableModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  },
  [AIProvider.OLLAMA]: {
    provider: AIProvider.OLLAMA,
    apiKey: '',
    baseUrl: 'http://localhost:11434',
    isConfigured: false,
    isConnected: false,
    availableModels: [],
  },
};

// Load provider configs from localStorage
export function loadProviderConfigs(): ProviderConfigs {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new providers
      return {
        ...DEFAULT_PROVIDER_CONFIGS,
        ...parsed,
      };
    }
  } catch (e) {
    console.error('Failed to load provider configs:', e);
  }
  return { ...DEFAULT_PROVIDER_CONFIGS };
}

// Save provider configs to localStorage
export function saveProviderConfigs(configs: ProviderConfigs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch (e) {
    console.error('Failed to save provider configs:', e);
  }
}

// Test Gemini connection
export async function testGeminiConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const client = new GoogleGenAI({ apiKey });
    const model = client.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: 'Say "connected" in one word.',
    });
    await model;
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Connection failed' };
  }
}

// Test OpenRouter connection
export async function testOpenRouterConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Connection failed' };
  }
}

// Test OpenAI connection
export async function testOpenAIConnection(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || 'Connection failed' };
  }
}

// Test Ollama connection and fetch models
export async function testOllamaConnection(baseUrl: string): Promise<{ success: boolean; models?: string[]; error?: string }> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const models = data.models?.map((m: any) => m.name) || [];
    return { success: true, models };
  } catch (e: any) {
    return { success: false, error: e.message || 'Connection failed' };
  }
}

// Test any provider connection
export async function testProviderConnection(
  provider: AIProvider,
  apiKey: string,
  baseUrl?: string
): Promise<{ success: boolean; models?: string[]; error?: string }> {
  switch (provider) {
    case AIProvider.GEMINI:
      return testGeminiConnection(apiKey);
    case AIProvider.OPENROUTER:
      return testOpenRouterConnection(apiKey);
    case AIProvider.OPENAI:
      return testOpenAIConnection(apiKey);
    case AIProvider.OLLAMA:
      return testOllamaConnection(baseUrl || 'http://localhost:11434');
    default:
      return { success: false, error: 'Unknown provider' };
  }
}
