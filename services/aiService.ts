import { AIProvider, AIConfig, ChatConfig, ChatSession, Persona } from '../types';
import { geminiProvider } from './providers/geminiProvider';
import { openRouterProvider } from './providers/openRouterProvider';
import { openAIProvider } from './providers/openAIProvider';
import { ollamaProvider } from './providers/ollamaProvider';
import { buildSystemPrompt } from './prompts';
import { AIProviderAdapter } from './providers/types';

const providerAdapters: Record<AIProvider, AIProviderAdapter> = {
  [AIProvider.GEMINI]: geminiProvider,
  [AIProvider.OPENROUTER]: openRouterProvider,
  [AIProvider.OPENAI]: openAIProvider,
  [AIProvider.OLLAMA]: ollamaProvider,
};

const DEFAULT_MAX_TOKENS = 200;
const DEFAULT_TEMPERATURE = 0.7;

export function createChatSession(
  aiConfig: AIConfig,
  persona: Persona,
  customGameRules?: string
): ChatSession {
  const adapter = providerAdapters[aiConfig.provider];

  if (!adapter) {
    throw new Error(`Unknown provider: ${aiConfig.provider}`);
  }

  const chatConfig: ChatConfig = {
    systemPrompt: buildSystemPrompt(persona, customGameRules),
    maxOutputTokens: DEFAULT_MAX_TOKENS,
    temperature: DEFAULT_TEMPERATURE,
  };

  return adapter.createSession(aiConfig.auth, aiConfig.model, chatConfig);
}

export async function getChatResponse(
  session: ChatSession,
  message: string
): Promise<string> {
  return session.sendMessage(message);
}

export type { ChatSession };
