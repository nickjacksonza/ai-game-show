import React from 'react';
import { Contestant } from '../types';
import { ContestantSquare } from './ContestantSquare';

interface Props {
  contestants: Contestant[];
  eliminationMode: boolean;
  scoresLocked: boolean;
  onEliminate: (id: string) => void;
  onViewAnswer: (contestant: Contestant) => void;
  onUpdateScore: (id: string, delta: number) => void;
  onOpenSettings: (contestant: Contestant) => void;
}

export const ContestantGrid: React.FC<Props> = ({
  contestants,
  eliminationMode,
  scoresLocked,
  onEliminate,
  onViewAnswer,
  onUpdateScore,
  onOpenSettings,
}) => {
  // Ensure we always have 9 slots (fill with null for empty spots)
  const gridSlots = [...contestants.slice(0, 9)];
  while (gridSlots.length < 9) {
    gridSlots.push(null as unknown as Contestant);
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Celebrity Squares Title Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-900/30 via-slate-800/50 to-purple-900/30 px-8 py-3 rounded-full border border-purple-500/20 backdrop-blur-sm">
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
              <div className="relative w-3 h-3 rounded-full bg-red-500" />
            </div>
            <span className="text-sm font-bold text-red-400 uppercase tracking-wider">Live</span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-600" />

          {/* Game info */}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-sm text-purple-300 font-medium">
              {contestants.filter(c => !c.eliminated).length} Active
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-600" />

          {/* Eliminated count */}
          {contestants.filter(c => c.eliminated).length > 0 && (
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span className="text-sm">{contestants.filter(c => c.eliminated).length} Eliminated</span>
            </div>
          )}
        </div>
      </div>

      {/* 3x3 Celebrity Squares Grid */}
      <div className="relative">
        {/* Grid background decoration */}
        <div className="absolute inset-0 squares-grid rounded-3xl opacity-30" />

        {/* Outer glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl blur-xl" />

        {/* Main grid */}
        <div className="relative grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-5 p-3 md:p-4 bg-slate-950/50 rounded-3xl border border-purple-500/20 backdrop-blur-sm">
          {gridSlots.map((contestant, index) => {
            if (!contestant) {
              // Empty slot with decorative styling
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-[4/5] rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/20 flex flex-col items-center justify-center gap-2 transition-all hover:border-slate-600/50"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-slate-600 text-xs font-medium">Empty Slot</span>
                </div>
              );
            }

            return (
              <div key={contestant.id} className="aspect-[4/5]">
                <ContestantSquare
                  contestant={contestant}
                  eliminationMode={eliminationMode}
                  scoresLocked={scoresLocked}
                  onEliminate={onEliminate}
                  onViewAnswer={onViewAnswer}
                  onUpdateScore={onUpdateScore}
                  onOpenSettings={onOpenSettings}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Elimination Mode Warning Banner */}
      {eliminationMode && (
        <div className="mt-6 text-center animate-slide-up">
          <div className="inline-flex items-center gap-3 bg-red-500/10 text-red-400 px-6 py-3 rounded-full border border-red-500/30 animate-pulse">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
              <div className="relative w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <span className="font-bold tracking-wide">ELIMINATION MODE ACTIVE</span>
            <span className="text-red-300/70">— Click a contestant to eliminate</span>
          </div>
        </div>
      )}

      {/* Status legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-600 ring-2 ring-slate-600 ring-offset-1 ring-offset-slate-900" />
          <span>Idle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-500 ring-offset-1 ring-offset-slate-900 animate-pulse" />
          <span>Thinking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500 ring-offset-1 ring-offset-slate-900" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-red-600 ring-offset-1 ring-offset-slate-900 opacity-50" />
          <span>Eliminated</span>
        </div>
      </div>
    </div>
  );
};
