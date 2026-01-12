import React from 'react';
import { Contestant } from '../types';
import { PROVIDER_LABELS } from '../constants';

interface Props {
  contestant: Contestant | null;
  currentRound: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const EliminationModal: React.FC<Props> = ({
  contestant,
  currentRound,
  onConfirm,
  onCancel,
}) => {
  if (!contestant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-slate-900 rounded-xl border-2 border-red-500/50 p-6 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-shake-once">
        <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Eliminate Contestant?
        </h3>

        {/* Contestant Preview */}
        <div className="bg-slate-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-4xl ring-4 ring-red-500/30">
              {contestant.persona.avatar}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white text-lg">{contestant.persona.name}</h4>
              <p className="text-sm text-slate-400">{PROVIDER_LABELS[contestant.aiConfig.provider]}</p>
              <p className="text-sm text-slate-500">{contestant.aiConfig.model}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-purple-400">{contestant.score}</div>
              <div className="text-xs text-slate-500">points</div>
            </div>
          </div>
        </div>

        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-300">
            <strong>Warning:</strong> This contestant will be permanently eliminated from Round {currentRound} and all future rounds. They will not be able to answer any more questions.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-error gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Eliminate
          </button>
        </div>
      </div>
    </div>
  );
};
