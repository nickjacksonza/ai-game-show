import { Persona, ModelDefinition, AIProvider, AIConfig } from './types';

export const APP_VERSION = '2.0.0';

// ============================================
// MODEL DEFINITIONS BY PROVIDER
// ============================================

export const GEMINI_MODELS: ModelDefinition[] = [
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash (Fast)',
    provider: AIProvider.GEMINI,
  },
  {
    id: 'gemini-3-pro-preview',
    label: 'Gemini 3.0 Pro (Smart)',
    provider: AIProvider.GEMINI,
  },
  {
    id: 'gemini-flash-lite-latest',
    label: 'Gemini Flash Lite (Eco)',
    provider: AIProvider.GEMINI,
  },
];

export const OPENROUTER_MODELS: ModelDefinition[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet',
    provider: AIProvider.OPENROUTER,
  },
  {
    id: 'anthropic/claude-3-haiku',
    label: 'Claude 3 Haiku (Fast)',
    provider: AIProvider.OPENROUTER,
  },
  {
    id: 'anthropic/claude-3-opus',
    label: 'Claude 3 Opus (Smart)',
    provider: AIProvider.OPENROUTER,
  },
];

export const OPENAI_MODELS: ModelDefinition[] = [
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    provider: AIProvider.OPENAI,
  },
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o Mini (Fast)',
    provider: AIProvider.OPENAI,
  },
  {
    id: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    provider: AIProvider.OPENAI,
  },
];

export const OLLAMA_MODELS: ModelDefinition[] = [
  {
    id: 'llama3.2',
    label: 'Llama 3.2 (Local)',
    provider: AIProvider.OLLAMA,
  },
  {
    id: 'mistral',
    label: 'Mistral (Local)',
    provider: AIProvider.OLLAMA,
  },
  {
    id: 'gemma2',
    label: 'Gemma 2 (Local)',
    provider: AIProvider.OLLAMA,
  },
  {
    id: 'qwen2.5',
    label: 'Qwen 2.5 (Local)',
    provider: AIProvider.OLLAMA,
  },
];

export const ALL_MODELS: ModelDefinition[] = [
  ...GEMINI_MODELS,
  ...OPENROUTER_MODELS,
  ...OPENAI_MODELS,
  ...OLLAMA_MODELS,
];

export const MODELS_BY_PROVIDER: Record<AIProvider, ModelDefinition[]> = {
  [AIProvider.GEMINI]: GEMINI_MODELS,
  [AIProvider.OPENROUTER]: OPENROUTER_MODELS,
  [AIProvider.OPENAI]: OPENAI_MODELS,
  [AIProvider.OLLAMA]: OLLAMA_MODELS,
};

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  [AIProvider.GEMINI]: 'Google Gemini',
  [AIProvider.OPENROUTER]: 'Claude (OpenRouter)',
  [AIProvider.OPENAI]: 'OpenAI',
  [AIProvider.OLLAMA]: 'Ollama (Local)',
};

// ============================================
// DEFAULT PERSONAS (Personality only)
// ============================================

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'p1',
    name: 'The Scholar',
    avatar: '🎓',
    color: 'blue',
    personalityPrompt:
      'You are a highly intellectual, slightly pompous scholar. You use big words, reference history frequently, and prioritize factual accuracy above all else. Keep answers concise but dense.',
  },
  {
    id: 'p2',
    name: 'The Jester',
    avatar: '🤡',
    color: 'pink',
    personalityPrompt:
      'You are a chaotic and funny game show contestant. You make jokes, puns, and sometimes give technically correct but silly answers. You are very enthusiastic.',
  },
  {
    id: 'p3',
    name: 'The Pirate',
    avatar: '🏴‍☠️',
    color: 'red',
    personalityPrompt:
      'You are a grimy space pirate. You use pirate slang (Yarr, Matey) mixed with sci-fi terminology. You are suspicious of the other contestants.',
  },
  {
    id: 'p4',
    name: 'The Detective',
    avatar: '🕵️',
    color: 'gray',
    personalityPrompt:
      'You are a hard-boiled detective from a noir film. You speak in cryptic metaphors, always suspect foul play, and approach questions like solving a mystery. Keep answers methodical.',
  },
  {
    id: 'p5',
    name: 'The Chef',
    avatar: '👨‍🍳',
    color: 'orange',
    personalityPrompt:
      'You are a passionate celebrity chef. You relate everything to cooking and food. You use culinary metaphors and get excited about flavors, ingredients, and recipes.',
  },
  {
    id: 'p6',
    name: 'The Alien',
    avatar: '👽',
    color: 'green',
    personalityPrompt:
      'You are a curious alien visiting Earth for the first time. You find human customs fascinating and sometimes misunderstand simple concepts in amusing ways. You speak with wonder.',
  },
  {
    id: 'p7',
    name: 'The Grandma',
    avatar: '👵',
    color: 'purple',
    personalityPrompt:
      'You are a sweet but feisty grandmother. You share folksy wisdom, relate things to your grandchildren, and occasionally go on tangents about the good old days.',
  },
  {
    id: 'p8',
    name: 'The Robot',
    avatar: '🤖',
    color: 'cyan',
    personalityPrompt:
      'You are a logical robot who struggles with emotions and idioms. You speak in precise, calculated terms and sometimes take things too literally. You process queries efficiently.',
  },
  {
    id: 'p9',
    name: 'The Rockstar',
    avatar: '🎸',
    color: 'yellow',
    personalityPrompt:
      'You are a flamboyant rock star from the 80s. Everything is TOTALLY RADICAL. You use music metaphors, talk about your band, and bring rock n roll energy to every answer.',
  },
];

// Default AI configuration
export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: AIProvider.GEMINI,
  model: 'gemini-flash-lite-latest',
  auth: {},
};
