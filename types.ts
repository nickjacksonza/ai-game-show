// ============================================
// PROVIDER CONFIGURATION
// ============================================

export enum AIProvider {
  GEMINI = 'gemini',
  OPENROUTER = 'openrouter',
  OPENAI = 'openai',
  OLLAMA = 'ollama',
}

export type ModelId = string;

export interface ModelDefinition {
  id: ModelId;
  label: string;
  provider: AIProvider;
  description?: string;
}

export interface ProviderAuthConfig {
  apiKey?: string;
  baseUrl?: string;
}

// ============================================
// PERSONA (Personality/display only)
// ============================================

export interface Persona {
  id: string;
  name: string;
  avatar: string;
  color: string;
  personalityPrompt: string;
}

// ============================================
// AI CONFIGURATION
// ============================================

export interface AIConfig {
  provider: AIProvider;
  model: ModelId;
  auth: ProviderAuthConfig;
}

// ============================================
// CONTESTANT STATUS
// ============================================

export type ContestantStatus = 'idle' | 'thinking' | 'answered' | 'eliminated';

// ============================================
// CONTESTANT
// ============================================

export interface Contestant {
  id: string;
  persona: Persona;
  aiConfig: AIConfig;
  currentAnswer: string;
  status: ContestantStatus;
  score: number;
  eliminated: boolean;
  eliminatedInRound?: number;
}

// ============================================
// ROUND & QUESTION TRACKING
// ============================================

export interface Answer {
  contestantId: string;
  text: string;
  submittedAt: number;
  score?: number;
}

export interface Question {
  id: string;
  text: string;
  askedAt: number;
  answers: Answer[];
}

export interface Round {
  roundNumber: number;
  questions: Question[];
  startTime: number;
  endTime?: number;
  scoresLockedAt?: number;
  eliminatedContestants: string[];
}

// ============================================
// GAME STATE
// ============================================

export interface GameState {
  currentRound: number;
  gameStatus: 'setup' | 'active' | 'paused' | 'ended';
  contestants: Contestant[];
  rounds: Round[];
  currentQuestion: Question | null;
  eliminationMode: boolean;
  scoresLocked: boolean;
}

// ============================================
// CHAT ABSTRACTION
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatConfig {
  systemPrompt: string;
  maxOutputTokens: number;
  temperature: number;
}

export interface ChatSession {
  sendMessage(message: string): Promise<string>;
  getHistory(): ChatMessage[];
  clearHistory(): void;
}
