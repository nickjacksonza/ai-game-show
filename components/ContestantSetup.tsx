import React, { useState } from 'react';
import { AIProvider, Contestant, Persona } from '../types';
import { PROVIDER_LABELS, MODELS_BY_PROVIDER, DEFAULT_PERSONAS, DEFAULT_AI_CONFIG } from '../constants';
import { ProviderConfigs, ProviderConfig } from '../services/providerConfig';

interface Props {
  contestants: Contestant[];
  setContestants: React.Dispatch<React.SetStateAction<Contestant[]>>;
  providerConfigs: ProviderConfigs;
}

interface ContestantCardProps {
  contestant: Contestant;
  index: number;
  providerConfigs: ProviderConfigs;
  onUpdate: (updates: Partial<Contestant>) => void;
  onRemove: () => void;
}

const AVATAR_OPTIONS = ['🎓', '🤡', '🏴‍☠️', '🕵️', '👨‍🍳', '👽', '👵', '🤖', '🎸', '🧙', '🦸', '🎭', '🧛', '🥷', '🤠', '👻', '🦊', '🐲'];

const ContestantCard: React.FC<ContestantCardProps> = ({
  contestant,
  index,
  providerConfigs,
  onUpdate,
  onRemove
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(contestant.persona.name);
  const [avatar, setAvatar] = useState(contestant.persona.avatar);
  const [personalityPrompt, setPersonalityPrompt] = useState(contestant.persona.personalityPrompt);
  const [provider, setProvider] = useState(contestant.aiConfig.provider);
  const [model, setModel] = useState(contestant.aiConfig.model);

  // Get available providers (only configured ones)
  const availableProviders = ((Object.values(providerConfigs) as ProviderConfig[]) as ProviderConfig[]).filter(p => p.isConfigured && p.isConnected);

  // Get models for selected provider
  const getModelsForProvider = (p: AIProvider) => {
    if (p === AIProvider.OLLAMA) {
      return providerConfigs[AIProvider.OLLAMA].availableModels.map(m => ({ id: m, label: m }));
    }
    return MODELS_BY_PROVIDER[p] || [];
  };

  const availableModels = getModelsForProvider(provider);

  const handleSave = () => {
    onUpdate({
      persona: {
        ...contestant.persona,
        name: name.trim() || contestant.persona.name,
        avatar,
        personalityPrompt,
      },
      aiConfig: {
        ...contestant.aiConfig,
        provider,
        model,
      },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(contestant.persona.name);
    setAvatar(contestant.persona.avatar);
    setPersonalityPrompt(contestant.persona.personalityPrompt);
    setProvider(contestant.aiConfig.provider);
    setModel(contestant.aiConfig.model);
    setIsEditing(false);
  };

  // Check if current provider is configured
  const isProviderConfigured = providerConfigs[contestant.aiConfig.provider]?.isConnected;

  if (isEditing) {
    return (
      <div className="bg-slate-800/80 rounded-2xl border-2 border-purple-500/50 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-purple-400 font-medium">Editing Square #{index + 1}</span>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Avatar & Name */}
        <div className="flex gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Avatar</label>
            <div className="flex flex-wrap gap-1 max-w-[180px]">
              {AVATAR_OPTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                    avatar === a
                      ? 'bg-purple-600 ring-2 ring-purple-400'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
              placeholder="Contestant name"
            />
          </div>
        </div>

        {/* AI Provider & Model */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-2">AI Provider</label>
            <select
              value={provider}
              onChange={(e) => {
                const newProvider = e.target.value as AIProvider;
                setProvider(newProvider);
                const models = getModelsForProvider(newProvider);
                if (models.length > 0) {
                  setModel(models[0].id);
                }
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              {availableProviders.map((p) => (
                <option key={p.provider} value={p.provider}>
                  {PROVIDER_LABELS[p.provider]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Personality Prompt */}
        <div>
          <label className="block text-xs text-slate-400 mb-2">
            Personality Prompt <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            value={personalityPrompt}
            onChange={(e) => setPersonalityPrompt(e.target.value)}
            placeholder="Describe this contestant's personality, speaking style, and quirks..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none h-24 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg font-medium text-sm bg-purple-600 hover:bg-purple-500 text-white transition-all"
          >
            Save Changes
          </button>
          <button
            onClick={onRemove}
            className="px-4 py-2 rounded-lg font-medium text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-all"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`bg-slate-800/50 rounded-2xl border transition-all cursor-pointer hover:border-purple-500/50 hover:bg-slate-800/70 ${
        isProviderConfigured ? 'border-slate-700/50' : 'border-amber-500/50'
      }`}
    >
      <div className="p-4 flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-xl bg-slate-700 flex items-center justify-center text-3xl">
          {contestant.persona.avatar}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white truncate">{contestant.persona.name}</h3>
            <span className="text-xs text-slate-500">#{index + 1}</span>
          </div>
          <p className="text-sm text-slate-400 truncate">
            {PROVIDER_LABELS[contestant.aiConfig.provider]} • {contestant.aiConfig.model}
          </p>
          {!isProviderConfigured && (
            <p className="text-xs text-amber-400 mt-1">
              ⚠ Provider not configured
            </p>
          )}
        </div>

        {/* Edit indicator */}
        <div className="text-slate-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
      </div>

      {/* Personality preview */}
      {contestant.persona.personalityPrompt && (
        <div className="px-4 pb-4">
          <p className="text-xs text-slate-500 line-clamp-2">
            {contestant.persona.personalityPrompt}
          </p>
        </div>
      )}
    </div>
  );
};

export const ContestantSetup: React.FC<Props> = ({ contestants, setContestants, providerConfigs }) => {
  // Get first available provider for new contestants
  const getDefaultProvider = () => {
    const available = (Object.values(providerConfigs) as ProviderConfig[]).find(p => p.isConfigured && p.isConnected);
    if (available) {
      const models = available.provider === AIProvider.OLLAMA
        ? available.availableModels
        : MODELS_BY_PROVIDER[available.provider].map(m => m.id);
      return {
        provider: available.provider,
        model: models[0] || 'gemini-flash-lite-latest',
      };
    }
    return { provider: AIProvider.GEMINI, model: 'gemini-flash-lite-latest' };
  };

  const handleUpdate = (id: string, updates: Partial<Contestant>) => {
    setContestants(prev =>
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  const handleRemove = (id: string) => {
    setContestants(prev => prev.filter(c => c.id !== id));
  };

  const handleAdd = () => {
    if (contestants.length >= 9) return;

    // Find an unused persona
    const usedIds = contestants.map(c => c.persona.id);
    const availablePersona = DEFAULT_PERSONAS.find(p => !usedIds.includes(p.id));

    const { provider, model } = getDefaultProvider();

    const newContestant: Contestant = {
      id: `c-${Date.now()}`,
      persona: availablePersona || {
        id: `p-${Date.now()}`,
        name: `Contestant ${contestants.length + 1}`,
        avatar: AVATAR_OPTIONS[contestants.length % AVATAR_OPTIONS.length],
        color: 'purple',
        personalityPrompt: '',
      },
      aiConfig: {
        provider,
        model,
        auth: {},
      },
      currentAnswer: '',
      status: 'idle',
      score: 0,
      eliminated: false,
    };

    setContestants(prev => [...prev, newContestant]);
  };

  const handleAutoAssign = () => {
    const availableProviders = (Object.values(providerConfigs) as ProviderConfig[]).filter(p => p.isConfigured && p.isConnected);
    if (availableProviders.length === 0) return;

    setContestants(prev =>
      prev.map((c, index) => {
        const providerConfig = availableProviders[index % availableProviders.length];
        const models = providerConfig.provider === AIProvider.OLLAMA
          ? providerConfig.availableModels
          : MODELS_BY_PROVIDER[providerConfig.provider].map(m => m.id);

        return {
          ...c,
          aiConfig: {
            ...c.aiConfig,
            provider: providerConfig.provider,
            model: models[index % models.length] || models[0],
          },
        };
      })
    );
  };

  const availableProviders = (Object.values(providerConfigs) as ProviderConfig[]).filter(p => p.isConfigured && p.isConnected);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Configure Contestants</h2>
          <p className="text-slate-400 text-sm">
            Set up your 9 Celebrity Squares contestants. Click on a contestant to edit their name, personality, and AI model.
          </p>
        </div>
        <div className="flex gap-2">
          {availableProviders.length > 0 && (
            <button
              onClick={handleAutoAssign}
              className="px-4 py-2 rounded-lg font-medium text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
            >
              Auto-Assign Models
            </button>
          )}
          {contestants.length < 9 && (
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg font-medium text-sm bg-purple-600 hover:bg-purple-500 text-white transition-all"
            >
              + Add Contestant
            </button>
          )}
        </div>
      </div>

      {availableProviders.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-400 text-sm">
          ⚠ No AI providers configured. Go to the <strong>AI Providers</strong> tab to set up at least one provider.
        </div>
      )}

      {/* Contestant Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contestants.map((contestant, index) => (
          <ContestantCard
            key={contestant.id}
            contestant={contestant}
            index={index}
            providerConfigs={providerConfigs}
            onUpdate={(updates) => handleUpdate(contestant.id, updates)}
            onRemove={() => handleRemove(contestant.id)}
          />
        ))}

        {/* Add slot */}
        {contestants.length < 9 && (
          <button
            onClick={handleAdd}
            className="bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-700 p-8 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-slate-400 hover:border-slate-600 transition-all min-h-[140px]"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium">Add Contestant</span>
            <span className="text-xs">{contestants.length}/9</span>
          </button>
        )}
      </div>

      {/* Grid Layout Preview */}
      <div className="bg-slate-800/30 rounded-xl p-4">
        <h3 className="text-sm text-slate-400 mb-3">Grid Preview</h3>
        <div className="grid grid-cols-3 gap-2 max-w-xs">
          {[...Array(9)].map((_, i) => {
            const contestant = contestants[i];
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-2xl ${
                  contestant
                    ? 'bg-slate-700'
                    : 'bg-slate-800 border border-dashed border-slate-700'
                }`}
              >
                {contestant?.persona.avatar || ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
