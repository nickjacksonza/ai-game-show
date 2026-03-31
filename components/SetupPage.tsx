import React, { useState, useEffect } from 'react';
import { AIProvider, Contestant, Persona } from '../types';
import { DEFAULT_PERSONAS, DEFAULT_AI_CONFIG, MODELS_BY_PROVIDER, PROVIDER_LABELS, APP_VERSION } from '../constants';
import { ProviderManager } from './ProviderManager';
import { ContestantSetup } from './ContestantSetup';
import {
  ProviderConfigs,
  ProviderConfig,
  loadProviderConfigs,
  saveProviderConfigs,
  DEFAULT_PROVIDER_CONFIGS,
} from '../services/providerConfig';
import { DEFAULT_GAME_RULES } from '../services/prompts';

interface Props {
  onStartGame: (contestants: Contestant[], gameRules: string, providerConfigs: ProviderConfigs) => void;
}

type SetupTab = 'providers' | 'contestants' | 'rules';

export const SetupPage: React.FC<Props> = ({ onStartGame }) => {
  const [activeTab, setActiveTab] = useState<SetupTab>('providers');
  const [providerConfigs, setProviderConfigs] = useState<ProviderConfigs>(DEFAULT_PROVIDER_CONFIGS);
  const [gameRules, setGameRules] = useState(DEFAULT_GAME_RULES);
  const [contestants, setContestants] = useState<Contestant[]>(() =>
    DEFAULT_PERSONAS.slice(0, 9).map((persona) => ({
      id: persona.id,
      persona: persona,
      aiConfig: { ...DEFAULT_AI_CONFIG },
      currentAnswer: '',
      status: 'idle',
      score: 0,
      eliminated: false,
    }))
  );

  // Load saved provider configs on mount
  useEffect(() => {
    const saved = loadProviderConfigs();
    setProviderConfigs(saved);
  }, []);

  // Check if at least one provider is configured
  const hasConfiguredProvider = (Object.values(providerConfigs) as ProviderConfig[]).some(p => p.isConfigured && p.isConnected);

  // Get configured providers for contestant assignment
  const configuredProviders = (Object.values(providerConfigs) as ProviderConfig[]).filter(p => p.isConfigured && p.isConnected);

  const handleProviderUpdate = (provider: AIProvider, updates: Partial<ProviderConfigs[AIProvider]>) => {
    setProviderConfigs(prev => {
      const updated = {
        ...prev,
        [provider]: { ...prev[provider], ...updates },
      };
      saveProviderConfigs(updated);
      return updated;
    });
  };

  const handleStartGame = () => {
    if (!hasConfiguredProvider) {
      setActiveTab('providers');
      return;
    }
    onStartGame(contestants, gameRules, providerConfigs);
  };

  const tabs: { id: SetupTab; label: string; icon: string }[] = [
    { id: 'providers', label: 'AI Providers', icon: '🔌' },
    { id: 'contestants', label: 'Contestants', icon: '👥' },
    { id: 'rules', label: 'Game Rules', icon: '📜' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="font-display text-3xl md:text-5xl font-black uppercase tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400">
                AI Celebrity Squares
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-sm uppercase tracking-widest mt-2">
              Game Setup • v{APP_VERSION}
            </p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700/50 bg-slate-800/30">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium text-sm transition-all relative ${
                  activeTab === tab.id
                    ? 'text-purple-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
                {tab.id === 'providers' && !hasConfiguredProvider && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                    Required
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'providers' && (
          <ProviderManager
            configs={providerConfigs}
            onUpdate={handleProviderUpdate}
          />
        )}

        {activeTab === 'contestants' && (
          <ContestantSetup
            contestants={contestants}
            setContestants={setContestants}
            providerConfigs={providerConfigs}
          />
        )}

        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📜</span> Game Rules Prompt
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                This prompt is shared by all contestants. It sets the context for the game show competition.
              </p>
              <textarea
                value={gameRules}
                onChange={(e) => setGameRules(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors h-64 resize-none font-mono"
                placeholder="Enter the game rules..."
              />
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Each contestant receives: Game Rules + Their Personality Prompt</span>
                <span>{gameRules.length} characters</span>
              </div>
            </div>

            <button
              onClick={() => setGameRules(DEFAULT_GAME_RULES)}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Reset to default rules
            </button>
          </div>
        )}
      </main>

      {/* Footer with Start Button */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {hasConfiguredProvider ? (
              <span className="text-green-400">
                ✓ {configuredProviders.length} provider{configuredProviders.length !== 1 ? 's' : ''} ready
              </span>
            ) : (
              <span className="text-amber-400">
                ⚠ Configure at least one AI provider to start
              </span>
            )}
          </div>
          <button
            onClick={handleStartGame}
            disabled={!hasConfiguredProvider}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${
              hasConfiguredProvider
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            🎬 Start Game
          </button>
        </div>
      </footer>
    </div>
  );
};
