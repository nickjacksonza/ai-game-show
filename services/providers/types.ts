import { ChatConfig, ChatSession, ProviderAuthConfig } from '../../types';

export interface AIProviderAdapter {
  createSession(
    auth: ProviderAuthConfig,
    model: string,
    config: ChatConfig
  ): ChatSession;
}
