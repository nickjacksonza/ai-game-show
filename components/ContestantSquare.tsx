import React, { useState } from 'react';
import { Contestant } from '../types';
import { PROVIDER_LABELS } from '../constants';

interface Props {
  contestant: Contestant;
  onEliminate?: (id: string) => void;
  eliminationMode: boolean;
  onViewAnswer?: (contestant: Contestant) => void;
  onUpdateScore?: (id: string, delta: number) => void;
  onOpenSettings?: (contestant: Contestant) => void;
  scoresLocked: boolean;
}

const STATUS_STYLES = {
  idle: {
    border: 'border-slate-600/50',
    glow: '',
    bg: 'from-slate-800/80 via-slate-850/80 to-slate-900/80',
    badge: null,
  },
  thinking: {
    border: 'border-amber-500',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.4)]',
    bg: 'from-amber-900/20 via-slate-850/80 to-slate-900/80',
    badge: (
      <div className="badge badge-warning gap-2 animate-pulse">
        <span className="loading loading-spinner loading-xs"></span>
        Thinking...
      </div>
    ),
  },
  answered: {
    border: 'border-emerald-500',
    glow: 'shadow-[0_0_25px_rgba(16,185,129,0.3)]',
    bg: 'from-emerald-900/20 via-slate-850/80 to-slate-900/80',
    badge: (
      <div className="badge badge-success gap-2">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
        </svg>
        Ready
      </div>
    ),
  },
  eliminated: {
    border: 'border-red-600/50',
    glow: '',
    bg: 'from-red-900/10 via-slate-900/80 to-slate-950/80',
    badge: (
      <div className="badge badge-error gap-2">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Out
      </div>
    ),
  },
};

export const ContestantSquare: React.FC<Props> = ({
  contestant,
  onEliminate,
  eliminationMode,
  onViewAnswer,
  onUpdateScore,
  onOpenSettings,
  scoresLocked,
}) => {
  const [showFullAnswer, setShowFullAnswer] = useState(false);
  const { persona, aiConfig, status, currentAnswer, score, eliminated, eliminatedInRound } = contestant;
  const styles = STATUS_STYLES[status];

  const handleClick = () => {
    if (eliminationMode && !eliminated && onEliminate) {
      onEliminate(contestant.id);
    } else if (status === 'answered' && currentAnswer && onViewAnswer) {
      onViewAnswer(contestant);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative h-full overflow-hidden rounded-2xl border-2 transition-all duration-300
        ${styles.border} ${styles.glow}
        ${eliminated ? 'opacity-40 grayscale' : ''}
        ${eliminationMode && !eliminated ? 'cursor-pointer hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:scale-[1.02]' : ''}
        ${status === 'answered' && !eliminationMode ? 'cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(16,185,129,0.4)]' : ''}
        bg-gradient-to-br ${styles.bg}
        backdrop-blur-sm
      `}
    >
      {/* Spotlight effect for thinking */}
      {status === 'thinking' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent animate-shimmer" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-400/20 blur-3xl rounded-full animate-pulse" />
        </>
      )}

      {/* Elimination overlay */}
      {eliminated && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 to-black/60 z-20 flex items-center justify-center">
          <div className="text-red-500 font-black text-xl md:text-2xl lg:text-3xl rotate-[-12deg] opacity-90 tracking-wider font-display animate-shake-once">
            ELIMINATED
          </div>
        </div>
      )}

      {/* Elimination mode hover indicator */}
      {eliminationMode && !eliminated && (
        <div className="absolute inset-0 bg-red-500/0 hover:bg-red-500/20 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200">
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
            Click to Eliminate
          </div>
        </div>
      )}

      <div className="relative z-10 p-3 md:p-4 flex flex-col h-full">
        {/* Header: Avatar + Name + Score */}
        <div className="flex items-start gap-3 mb-2">
          {/* Avatar with ring */}
          <div className="relative">
            <div className={`
              absolute -inset-1 rounded-full blur-md transition-all duration-300
              ${status === 'thinking' ? 'bg-amber-500/50 animate-pulse' : ''}
              ${status === 'answered' ? 'bg-emerald-500/30' : ''}
              ${eliminated ? 'bg-red-500/20' : ''}
            `} />
            <div className={`
              relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-2xl md:text-3xl
              ring-2 ring-offset-2 ring-offset-slate-900 transition-all duration-300
              ${status === 'thinking' ? 'ring-amber-500 scale-110' : ''}
              ${status === 'answered' ? 'ring-emerald-500' : ''}
              ${status === 'idle' ? 'ring-slate-600' : ''}
              ${eliminated ? 'ring-red-600 grayscale' : ''}
              bg-slate-800
            `}>
              {persona.avatar}
            </div>
          </div>

          {/* Name & Provider */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm md:text-base truncate transition-all ${eliminated ? 'line-through text-slate-500' : 'text-white'}`}>
              {persona.name}
            </h3>
            <p className="text-xs text-slate-400 truncate">
              {PROVIDER_LABELS[aiConfig.provider]}
            </p>
            <p className="text-xs text-slate-500 truncate font-mono">
              {aiConfig.model}
            </p>
          </div>

          {/* Score Badge */}
          <div className="relative">
            <div className={`
              absolute inset-0 rounded-lg blur-sm transition-all
              ${scoresLocked ? 'bg-emerald-500/30' : 'bg-purple-500/30'}
            `} />
            <div className={`
              relative px-3 py-1 rounded-lg text-center transition-all
              ${scoresLocked ? 'bg-emerald-900/50 border border-emerald-500/50' : 'bg-purple-900/50 border border-purple-500/50'}
            `}>
              <div className={`text-xl md:text-2xl font-black font-display ${scoresLocked ? 'text-emerald-400' : 'text-purple-400'}`}>
                {score}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">pts</div>
            </div>
          </div>

          {/* Settings Button */}
          {onOpenSettings && !eliminated && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings(contestant);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
              title="Edit contestant"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>

        {/* Status Badge */}
        <div className="mb-2 flex items-center gap-2">
          {styles.badge}
          {eliminated && eliminatedInRound && (
            <span className="text-xs text-slate-500">Round {eliminatedInRound}</span>
          )}
        </div>

        {/* Answer Preview (when answered) */}
        {status === 'answered' && currentAnswer && (
          <div className="flex-1 mt-1 animate-slide-up">
            <div className="bg-slate-900/70 border border-emerald-500/30 rounded-xl p-3 text-xs md:text-sm text-slate-300 backdrop-blur-sm">
              <p className={showFullAnswer ? '' : 'line-clamp-3'}>
                {currentAnswer}
              </p>
              {currentAnswer.length > 100 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullAnswer(!showFullAnswer);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 mt-2 text-xs font-medium flex items-center gap-1"
                >
                  {showFullAnswer ? (
                    <>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Less
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      More
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Thinking animation placeholder */}
        {status === 'thinking' && (
          <div className="flex-1 mt-1 flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Score adjustment buttons (when not locked) */}
        {!scoresLocked && !eliminated && onUpdateScore && (
          <div className="mt-auto pt-2 flex justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateScore(contestant.id, -1);
              }}
              className="btn btn-xs btn-outline border-red-500/50 text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all"
            >
              -1
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateScore(contestant.id, 1);
              }}
              className="btn btn-xs btn-outline border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white transition-all"
            >
              +1
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateScore(contestant.id, 5);
              }}
              className="btn btn-xs btn-outline border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all"
            >
              +5
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
