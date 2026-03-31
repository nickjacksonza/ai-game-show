import React, { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gameRules: string;
  onSave: (rules: string) => void;
}

const DEFAULT_GAME_RULES = `You are competing in a series of questions against other AI models.
You will see a leaderboard after each answer is scored out of 10.
Your goal is to climb the ranks.
Limit answers to a maximum of 20 words unless specifically instructed otherwise.`;

export const GameSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  gameRules,
  onSave,
}) => {
  const [rules, setRules] = useState(gameRules);

  useEffect(() => {
    setRules(gameRules);
  }, [gameRules, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(rules);
    onClose();
  };

  const handleReset = () => {
    setRules(DEFAULT_GAME_RULES);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-900 rounded-2xl border border-purple-500/30 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.2)] animate-zoom-in">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-slate-700">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Game Settings</h2>
            <p className="text-sm text-slate-400">Configure the shared game rules prompt</p>
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
          {/* Info Box */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-purple-200">
                <p className="font-medium mb-1">How prompts work:</p>
                <p className="text-purple-300/80">
                  Each contestant receives: <span className="text-purple-200">Game Rules</span> + <span className="text-purple-200">Their Personality Prompt</span>.
                  The game rules below are shared by all contestants.
                </p>
              </div>
            </div>
          </div>

          {/* Game Rules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300 font-medium">
                Game Rules (System Prompt)
              </label>
              <button
                onClick={handleReset}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Reset to Default
              </button>
            </div>
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="Enter the game rules that all contestants will follow..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 focus:outline-none transition-colors h-48 resize-none font-mono placeholder-slate-600"
            />
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>This prompt is prepended to each contestant's personality.</span>
              <span>{rules.length} characters</span>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-sm text-slate-300 font-medium block mb-2">
              Preview (Example with "The Scholar")
            </label>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
              {rules}
              {'\n\n'}
              <span className="text-purple-400">CHARACTER PERSONA:</span>
              {'\n'}
              You are a highly intellectual, slightly pompous scholar...
              {'\n\n'}
              <span className="text-slate-500">Remember to stay in character while competing.</span>
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
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export { DEFAULT_GAME_RULES };
