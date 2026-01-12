import React from 'react';
import { Contestant, AIProvider } from '../types';
import { MODELS_BY_PROVIDER, PROVIDER_LABELS } from '../constants';

interface ContestantPodiumProps {
  contestant: Contestant;
  onUpdateSettings: (id: string, updates: Partial<Contestant>) => void;
}

export const ContestantPodium: React.FC<ContestantPodiumProps> = ({
  contestant,
  onUpdateSettings,
}) => {
  const { persona, aiConfig, currentAnswer, isThinking, score } = contestant;
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const getGlowColor = () => {
    switch (persona.color) {
      case 'blue':
        return 'shadow-blue-500/50 border-blue-500';
      case 'pink':
        return 'shadow-pink-500/50 border-pink-500';
      case 'red':
        return 'shadow-red-500/50 border-red-500';
      default:
        return 'shadow-purple-500/50 border-purple-500';
    }
  };

  const getBgGradient = () => {
    switch (persona.color) {
      case 'blue':
        return 'from-blue-900/40 to-slate-900';
      case 'pink':
        return 'from-pink-900/40 to-slate-900';
      case 'red':
        return 'from-red-900/40 to-slate-900';
      default:
        return 'from-purple-900/40 to-slate-900';
    }
  };

  const handleProviderChange = (newProvider: AIProvider) => {
    const firstModel = MODELS_BY_PROVIDER[newProvider][0];
    onUpdateSettings(contestant.id, {
      aiConfig: {
        provider: newProvider,
        model: firstModel.id,
        auth: {},
      },
    });
  };

  const handleModelChange = (newModel: string) => {
    onUpdateSettings(contestant.id, {
      aiConfig: { ...aiConfig, model: newModel },
    });
  };

  const handleAuthChange = (field: 'apiKey' | 'baseUrl', value: string) => {
    onUpdateSettings(contestant.id, {
      aiConfig: {
        ...aiConfig,
        auth: { ...aiConfig.auth, [field]: value || undefined },
      },
    });
  };

  const currentModels = MODELS_BY_PROVIDER[aiConfig.provider];
  const currentModelLabel =
    currentModels.find((m) => m.id === aiConfig.model)?.label || aiConfig.model;

  const showApiKey =
    aiConfig.provider !== AIProvider.OLLAMA;
  const showBaseUrl =
    aiConfig.provider === AIProvider.OLLAMA ||
    aiConfig.provider === AIProvider.OPENAI;

  return (
    <div
      className={`relative flex flex-col w-full h-full bg-gradient-to-b ${getBgGradient()} border-2 rounded-xl overflow-hidden transition-all duration-300 ${getGlowColor()} ${isThinking ? 'animate-pulse' : ''}`}
    >
      {/* Score Header */}
      <div className="bg-slate-950/50 p-3 flex justify-between items-center border-b border-slate-700/50">
        <div className="font-display text-2xl font-bold tracking-widest tabular-nums text-yellow-400">
          {score} pts
        </div>
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Settings Overlay */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-20 bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto">
          <h3 className="text-white font-bold border-b border-slate-700 pb-2">
            Configuration
          </h3>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Name (Max 20 chars)
            </label>
            <input
              type="text"
              maxLength={20}
              value={persona.name}
              onChange={(e) =>
                onUpdateSettings(contestant.id, {
                  persona: { ...persona, name: e.target.value },
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Avatar (Emoji)
            </label>
            <input
              type="text"
              maxLength={4}
              value={persona.avatar}
              onChange={(e) =>
                onUpdateSettings(contestant.id, {
                  persona: { ...persona, avatar: e.target.value },
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Provider Selection */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Provider
            </label>
            <select
              value={aiConfig.provider}
              onChange={(e) =>
                handleProviderChange(e.target.value as AIProvider)
              }
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
            >
              {Object.entries(PROVIDER_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Model</label>
            <select
              value={aiConfig.model}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
            >
              {currentModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* API Key (for Gemini, OpenRouter, OpenAI) */}
          {showApiKey && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                API Key{' '}
                {aiConfig.provider === AIProvider.GEMINI
                  ? '(Optional - overrides default)'
                  : '(Required)'}
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={aiConfig.auth.apiKey || ''}
                onChange={(e) => handleAuthChange('apiKey', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none font-mono placeholder-slate-600"
                placeholder={
                  aiConfig.provider === AIProvider.GEMINI
                    ? 'Override default key...'
                    : 'Enter API key...'
                }
              />
            </div>
          )}

          {/* Base URL (for Ollama and OpenAI) */}
          {showBaseUrl && (
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Base URL{' '}
                {aiConfig.provider === AIProvider.OLLAMA
                  ? '(Default: localhost:11434)'
                  : '(Optional - for compatible APIs)'}
              </label>
              <input
                type="text"
                value={aiConfig.auth.baseUrl || ''}
                onChange={(e) => handleAuthChange('baseUrl', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none font-mono placeholder-slate-600"
                placeholder={
                  aiConfig.provider === AIProvider.OLLAMA
                    ? 'http://localhost:11434'
                    : 'https://api.openai.com/v1'
                }
              />
            </div>
          )}

          {/* Personality Prompt */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Personality Prompt
            </label>
            <textarea
              value={persona.personalityPrompt}
              maxLength={1000}
              onChange={(e) =>
                onUpdateSettings(contestant.id, {
                  persona: { ...persona, personalityPrompt: e.target.value },
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:border-blue-500 outline-none h-24 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Game rules are added automatically. This is just the character
              personality.
            </p>
          </div>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="mt-auto bg-blue-600 text-white py-2 rounded hover:bg-blue-500 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center p-6">
        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-5xl shadow-inner border-4 border-slate-700 mb-4 relative group shrink-0">
          {persona.avatar}
          <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <h2 className="font-display text-xl font-bold text-white mb-1 text-center shrink-0">
          {persona.name}
        </h2>
        <span className="text-xs font-mono text-slate-400 mb-6 bg-slate-900 px-2 py-1 rounded border border-slate-800 shrink-0">
          {currentModelLabel}
        </span>

        <div className="w-full flex-1 flex items-center justify-center bg-slate-950/40 rounded-lg p-4 border border-slate-800/50 min-h-[160px] overflow-hidden">
          {isThinking ? (
            <div className="flex gap-2">
              <span
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          ) : (
            <div className="w-full h-full overflow-y-auto max-h-[200px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-2">
              <p className="text-center text-lg font-medium text-blue-100 leading-relaxed whitespace-pre-wrap">
                {currentAnswer ? (
                  currentAnswer
                ) : (
                  <span className="text-slate-600 italic text-sm">
                    Ready for the question, quizmaster!
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
