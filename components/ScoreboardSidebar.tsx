import React from 'react';
import { Contestant } from '../types';

interface Props {
  contestants: Contestant[];
  currentRound: number;
  scoresLocked: boolean;
  onLockScores: () => void;
  onOpenHistory: () => void;
}

export const ScoreboardSidebar: React.FC<Props> = ({
  contestants,
  currentRound,
  scoresLocked,
  onLockScores,
  onOpenHistory,
}) => {
  // Sort contestants by score (descending), eliminated last
  const sortedContestants = [...contestants].sort((a, b) => {
    if (a.eliminated && !b.eliminated) return 1;
    if (!a.eliminated && b.eliminated) return -1;
    return b.score - a.score;
  });

  const activeCount = contestants.filter(c => !c.eliminated).length;
  const answeredCount = contestants.filter(c => c.status === 'answered').length;

  const getRankBadge = (rank: number, eliminated: boolean) => {
    if (eliminated) return 'bg-slate-700 text-slate-500';
    if (rank === 1) return 'bg-gradient-to-br from-amber-400 to-amber-600 text-black';
    if (rank === 2) return 'bg-gradient-to-br from-slate-300 to-slate-500 text-black';
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-l-2 border-purple-500/30 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            SCOREBOARD
          </h2>
          {scoresLocked ? (
            <div className="badge badge-success gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              Locked
            </div>
          ) : (
            <div className="badge badge-warning gap-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Live
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Round {currentRound}</span>
          <span>{answeredCount}/{activeCount} answered</span>
        </div>
      </div>

      {/* Score List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sortedContestants.map((contestant, index) => {
          const rank = index + 1;
          const isEliminated = contestant.eliminated;

          return (
            <div
              key={contestant.id}
              className={`
                flex items-center gap-2 p-2 rounded-lg border transition-all duration-300
                ${isEliminated
                  ? 'bg-slate-900/50 border-slate-800 opacity-50'
                  : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50'
                }
              `}
            >
              {/* Rank Badge */}
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-black
                ${getRankBadge(rank, isEliminated)}
              `}>
                {rank}
              </div>

              {/* Avatar */}
              <div className={`text-xl ${isEliminated ? 'grayscale' : ''}`}>
                {contestant.persona.avatar}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isEliminated ? 'line-through text-slate-500' : 'text-white'}`}>
                  {contestant.persona.name}
                </p>
              </div>

              {/* Status indicator */}
              {contestant.status === 'thinking' && !isEliminated && (
                <span className="loading loading-dots loading-xs text-amber-500"></span>
              )}
              {contestant.status === 'answered' && !isEliminated && (
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              )}

              {/* Score */}
              <div className={`
                text-lg font-black min-w-[40px] text-right
                ${isEliminated ? 'text-slate-600' : scoresLocked ? 'text-emerald-400' : 'text-purple-400'}
              `}>
                {contestant.score}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-slate-700 space-y-2">
        {!scoresLocked ? (
          <button
            onClick={onLockScores}
            className="btn btn-success btn-sm w-full gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            Lock Scores
          </button>
        ) : (
          <div className="text-center text-xs text-emerald-400 py-2">
            Scores locked for Round {currentRound}
          </div>
        )}

        <button
          onClick={onOpenHistory}
          className="btn btn-ghost btn-sm w-full gap-2 text-slate-400 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View History
        </button>
      </div>
    </div>
  );
};
