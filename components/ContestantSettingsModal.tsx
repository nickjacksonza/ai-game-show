import React, { useState, useEffect } from 'react';
import { Contestant, AIProvider } from '../types';
import { MODELS_BY_PROVIDER, PROVIDER_LABELS } from '../constants';

interface Props {
  contestant: Contestant | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Contestant>) => void;
}

export const ContestantSettingsModal: React.FC<Props> = ({
  contestant,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [personalityPrompt, setPersonalityPrompt] = useState('');
  const [provider, setProvider] = useState<AIProvider>(AIProvider.GEMINI);
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (contestant) {
      setName(contestant.persona.name);
      setAvatar(contestant.persona.avatar);
      setPersonalityPrompt(contestant.persona.personalityPrompt);
      setProvider(contestant.aiConfig.provider);
      setModel(contestant.aiConfig.model);
      setApiKey(contestant.aiConfig.auth.apiKey || '');
      setBaseUrl(contestant.aiConfig.auth.baseUrl || '');
    }
  }, [contestant]);

  if (!contestant) return null;

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    const firstModel = MODELS_BY_PROVIDER[newProvider][0];
    setModel(firstModel.id);
  };

  const handleSave = () => {
    onSave(contestant.id, {
      persona: {
        ...contestant.persona,
        name: name.trim() || contestant.persona.name,
        avatar: avatar || contestant.persona.avatar,
        personalityPrompt,
      },
      aiConfig: {
        provider,
        model,
        auth: {
          apiKey: apiKey || undefined,
          baseUrl: baseUrl || undefined,
        },
      },
    });
    onClose();
  };

  const currentModels = MODELS_BY_PROVIDER[provider];
  const showApiKey = provider !== AIProvider.OLLAMA;
  const showBaseUrl = provider === AIProvider.OLLAMA || provider === AIProvider.OPENAI;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-900 rounded-2xl border border-purple-500/30 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.2)] animate-zoom-in">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-slate-700">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-3xl ring-2 ring-purple-500/30">
            {avatar}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Edit Contestant</h2>
            <p className="text-sm text-slate-400">Configure personality and AI model</p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-circle btn-ghost btn-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Name & Avatar Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                Name
              </label>
              <input
                type="text"
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contestant name..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                Avatar
              </label>
              <input
                type="text"
                maxLength={4}
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xl text-center focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Provider */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors"
            >
              {Object.entries(PROVIDER_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors"
            >
              {currentModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          {showApiKey && (
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                API Key
                <span className="text-slate-500 ml-1">
                  {provider === AIProvider.GEMINI ? '(Optional - overrides env)' : '(Required)'}
                </span>
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === AIProvider.GEMINI ? 'Uses GEMINI_API_KEY from env...' : 'Enter API key...'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-600"
              />
            </div>
          )}

          {/* Base URL */}
          {showBaseUrl && (
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                Base URL
                <span className="text-slate-500 ml-1">
                  {provider === AIProvider.OLLAMA ? '(Default: localhost:11434)' : '(Optional)'}
                </span>
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={provider === AIProvider.OLLAMA ? 'http://localhost:11434' : 'https://api.openai.com/v1'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:border-purple-500 focus:outline-none transition-colors placeholder-slate-600"
              />
            </div>
          )}

          {/* Personality Prompt */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">
              Personality Prompt
              <span className="text-slate-500 ml-1">(Optional - leave blank for neutral)</span>
            </label>
            <textarea
              value={personalityPrompt}
              maxLength={1000}
              onChange={(e) => setPersonalityPrompt(e.target.value)}
              placeholder="Describe the contestant's personality, speaking style, quirks..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors h-28 resize-none placeholder-slate-600"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-slate-500">
                The game rules are added automatically. This is just the character.
              </p>
              <span className="text-xs text-slate-500">{personalityPrompt.length}/1000</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700 bg-slate-900/50">
          <button
            onClick={onClose}
            className="btn btn-ghost flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary flex-1 gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
