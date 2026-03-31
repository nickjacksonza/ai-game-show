import React, { useState, useEffect } from 'react';
import { api, ApiKeyStatus } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDER_INFO: Record<string, { label: string; placeholder: string; showBaseUrl: boolean }> = {
  gemini: {
    label: 'Google Gemini',
    placeholder: 'AIzaSy...',
    showBaseUrl: false,
  },
  openrouter: {
    label: 'OpenRouter (Claude)',
    placeholder: 'sk-or-...',
    showBaseUrl: false,
  },
  openai: {
    label: 'OpenAI',
    placeholder: 'sk-...',
    showBaseUrl: true,
  },
  ollama: {
    label: 'Ollama (Local)',
    placeholder: 'No API key needed',
    showBaseUrl: true,
  },
};

export const ApiKeysModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState<ApiKeyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editBaseUrl, setEditBaseUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadKeys();
    }
  }, [isOpen]);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const keyStatuses = await api.getApiKeys();
      setKeys(keyStatuses);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    }
    setLoading(false);
  };

  const handleEdit = (provider: string, currentBaseUrl: string | null) => {
    setEditingProvider(provider);
    setEditValue('');
    setEditBaseUrl(currentBaseUrl || '');
  };

  const handleSave = async () => {
    if (!editingProvider) return;

    // Ollama doesn't need an API key
    if (editingProvider !== 'ollama' && !editValue.trim()) {
      return;
    }

    setSaving(true);
    try {
      if (editingProvider === 'ollama') {
        // For Ollama, just save the base URL
        await api.setApiKey(editingProvider, 'ollama-local', editBaseUrl || undefined);
      } else {
        await api.setApiKey(editingProvider, editValue, editBaseUrl || undefined);
      }
      await loadKeys();
      setEditingProvider(null);
      setEditValue('');
      setEditBaseUrl('');
    } catch (err) {
      console.error('Failed to save API key:', err);
    }
    setSaving(false);
  };

  const handleDelete = async (provider: string) => {
    if (!confirm(`Delete API key for ${PROVIDER_INFO[provider]?.label || provider}?`)) {
      return;
    }

    try {
      await api.deleteApiKey(provider);
      await loadKeys();
    } catch (err) {
      console.error('Failed to delete API key:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-slate-900 rounded-xl border border-slate-700 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">API Keys</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-400">
            Your API keys are encrypted and stored securely. They are only used server-side to make AI requests.
          </p>

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => {
                const info = PROVIDER_INFO[key.provider] || { label: key.provider, placeholder: '', showBaseUrl: false };
                const isEditing = editingProvider === key.provider;

                return (
                  <div key={key.provider} className="bg-slate-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-white">{info.label}</h3>
                        {key.hasKey && (
                          <span className="text-xs text-green-400">Configured</span>
                        )}
                        {!key.hasKey && key.provider !== 'ollama' && (
                          <span className="text-xs text-slate-500">Not configured</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!isEditing && (
                          <>
                            <button
                              onClick={() => handleEdit(key.provider, key.baseUrl)}
                              className="text-sm text-blue-400 hover:text-blue-300"
                            >
                              {key.hasKey ? 'Update' : 'Add'}
                            </button>
                            {key.hasKey && (
                              <button
                                onClick={() => handleDelete(key.provider)}
                                className="text-sm text-red-400 hover:text-red-300"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="space-y-3 mt-3">
                        {key.provider !== 'ollama' && (
                          <input
                            type="password"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder={info.placeholder}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                          />
                        )}
                        {info.showBaseUrl && (
                          <input
                            type="text"
                            value={editBaseUrl}
                            onChange={(e) => setEditBaseUrl(e.target.value)}
                            placeholder={key.provider === 'ollama' ? 'http://localhost:11434' : 'Custom base URL (optional)'}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                          />
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            disabled={saving || (key.provider !== 'ollama' && !editValue.trim())}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded text-sm transition-colors"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingProvider(null);
                              setEditValue('');
                              setEditBaseUrl('');
                            }}
                            className="text-slate-400 hover:text-white px-4 py-1.5 text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
