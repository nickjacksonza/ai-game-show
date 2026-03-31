export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: 'google' | 'github';
  providerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: string;
  userId: string;
  provider: 'gemini' | 'openrouter' | 'openai' | 'ollama';
  encryptedKey: string;
  iv: string;
  authTag: string;
  baseUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyStatus {
  provider: string;
  hasKey: boolean;
  baseUrl: string | null;
  updatedAt: string | null;
}

export interface GameSession {
  id: string;
  userId: string;
  title: string | null;
  startedAt: string;
  endedAt: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  contestantsConfig: string;
  finalScores: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionLog {
  id: string;
  sessionId: string;
  level: number;
  round: number;
  question: string;
  answers: string;
  scores: string | null;
  timestamp: string;
}

export interface LevelReport {
  id: string;
  sessionId: string;
  level: number;
  reportContent: string;
  levelScores: string;
  createdAt: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  displayName: string | null;
}

export interface ChatRequest {
  provider: string;
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  config?: {
    maxTokens?: number;
    temperature?: number;
  };
}

export interface ChatResponse {
  content: string;
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      displayName: string | null;
      avatarUrl: string | null;
      provider: 'google' | 'github';
      providerId: string;
    }
  }
}
