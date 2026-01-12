import React, { useState } from 'react';
import { AIProvider } from '../types';
import { PROVIDER_LABELS, MODELS_BY_PROVIDER } from '../constants';
import {
  ProviderConfigs,
  ProviderConfig,
  testProviderConnection,
} from '../services/providerConfig';

interface Props {
  configs: ProviderConfigs;
  onUpdate: (provider: AIProvider, updates: Partial<ProviderConfig>) => void;
}

interface ProviderCardProps {
  config: ProviderConfig;
  onUpdate: (updates: Partial<ProviderConfig>) => void;
}

const PROVIDER_INFO: Record<AIProvider, { icon: string; description: string; keyUrl: string; requiresKey: boolean }> = {
  [AIProvider.GEMINI]: {
    icon: '✨',
    description: 'Google\'s Gemini models - fast and capable',
    keyUrl: 'https://aistudio.google.com/apikey',
    requiresKey: true,
  },
  [AIProvider.OPENROUTER]: {
    icon: '🔀',
    description: 'Access Claude and other models via OpenRouter',
    keyUrl: 'https://openrouter.ai/keys',
    requiresKey: true,
  },
  [AIProvider.OPENAI]: {
    icon: '🤖',
    description: 'OpenAI GPT models',
    keyUrl: 'https://platform.openai.com/api-keys',
    requiresKey: true,
  },
  [AIProvider.OLLAMA]: {
    icon: '🦙',
    description: 'Run local models with Ollama - no API key needed',
    keyUrl: 'https://ollama.ai',
    requiresKey: false,
  },
};

const ProviderCard: React.FC<ProviderCardProps> = ({ config, onUpdate }) => {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [baseUrl, setBaseUrl] = useState(config.baseUrl || 'http://localhost:11434');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  const info = PROVIDER_INFO[config.provider];
  const isOllama = config.provider === AIProvider.OLLAMA;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    const result = await testProviderConnection(
      config.provider,
      apiKey,
      isOllama ? baseUrl : undefined
    );

    setTestResult(result);
    setTesting(false);

    if (result.success) {
      onUpdate({
        apiKey: isOllama ? '' : apiKey,
        baseUrl: isOllama ? baseUrl : undefined,
        isConfigured: true,
        isConnected: true,
        availableModels: result.models || config.availableModels,
      });
    } else {
      onUpdate({
        isConnected: false,
      });
    }
  };

  const handleSave = () => {
    onUpdate({
      apiKey: isOllama ? '' : apiKey,
      baseUrl: isOllama ? baseUrl : undefined,
      isConfigured: isOllama ? !!baseUrl : !!apiKey,
    });
  };

  const handleClear = () => {
    setApiKey('');
    setBaseUrl('http://localhost:11434');
    setTestResult(null);
    onUpdate({
      apiKey: '',
      baseUrl: isOllama ? 'http://localhost:11434' : undefined,
      isConfigured: false,
      isConnected: false,
    });
  };

  return (
    <div className={`bg-slate-800/50 rounded-2xl border transition-all ${
      config.isConnected
        ? 'border-green-500/50 shadow-lg shadow-green-500/10'
        : 'border-slate-700/50'
    }`}>
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
            config.isConnected ? 'bg-green-500/20' : 'bg-slate-700/50'
          }`}>
            {info.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">{PROVIDER_LABELS[config.provider]}</h3>
              {config.isConnected && (
                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                  Connected
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">{info.description}</p>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="p-5 space-y-4">
        {isOllama ? (
          // Ollama: Base URL input
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Ollama Server URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Default: http://localhost:11434
            </p>
          </div>
        ) : (
          // Other providers: API Key input
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none pr-20"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Get your key: <a href={info.keyUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">{info.keyUrl}</a>
            </p>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div className={`p-3 rounded-lg text-sm ${
            testResult.success
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {testResult.success ? (
              <span>✓ Connection successful!</span>
            ) : (
              <span>✗ {testResult.error || 'Connection failed'}</span>
            )}
          </div>
        )}

        {/* Available Models (for Ollama when connected) */}
        {isOllama && config.isConnected && config.availableModels.length > 0 && (
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Available Models ({config.availableModels.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {config.availableModels.slice(0, 8).map((model) => (
                <span
                  key={model}
                  className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded-md"
                >
                  {model}
                </span>
              ))}
              {config.availableModels.length > 8 && (
                <span className="px-2 py-1 text-xs text-slate-500">
                  +{config.availableModels.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Default Models (for non-Ollama providers) */}
        {!isOllama && (
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Available Models
            </label>
            <div className="flex flex-wrap gap-2">
              {MODELS_BY_PROVIDER[config.provider].map((model) => (
                <span
                  key={model.id}
                  className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded-md"
                >
                  {model.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleTest}
            disabled={testing || (isOllama ? !baseUrl : !apiKey)}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              testing || (isOllama ? !baseUrl : !apiKey)
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            {testing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Testing...
              </span>
            ) : (
              `Test ${isOllama ? 'Connection' : '& Save'}`
            )}
          </button>
          {config.isConfigured && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-lg font-medium text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProviderManager: React.FC<Props> = ({ configs, onUpdate }) => {
  const providers = [AIProvider.GEMINI, AIProvider.OPENROUTER, AIProvider.OPENAI, AIProvider.OLLAMA];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Configure AI Providers</h2>
        <p className="text-slate-400 text-sm">
          Set up your API keys for the AI providers you want to use. You need at least one provider configured to start the game.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <ProviderCard
            key={provider}
            config={configs[provider]}
            onUpdate={(updates) => onUpdate(provider, updates)}
          />
        ))}
      </div>

      {/* Tips */}
      <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
        <h3 className="font-medium text-purple-300 mb-2">💡 Tips</h3>
        <ul className="text-sm text-purple-200/80 space-y-1">
          <li>• <strong>Gemini</strong> offers a free tier - great for testing!</li>
          <li>• <strong>Ollama</strong> runs locally - no API key needed, just install and run Ollama</li>
          <li>• <strong>OpenRouter</strong> gives access to Claude and many other models</li>
          <li>• You can mix providers - different contestants can use different AI models</li>
        </ul>
      </div>
    </div>
  );
};
