import React, { useState } from 'react';

interface QuizmasterConsoleProps {
  question: string;
  setQuestion: (q: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  currentRound: number;
  questionCount: number;
  activeContestantCount: number;
  answeredCount: number;
  eliminationMode: boolean;
  onToggleEliminationMode: () => void;
  onEndRound: () => void;
  onNextRound: () => void;
  onOpenHistory: () => void;
  onAnnounceScores: () => void;
}

export const QuizmasterConsole: React.FC<QuizmasterConsoleProps> = ({
  question,
  setQuestion,
  onSubmit,
  isProcessing,
  currentRound,
  questionCount,
  activeContestantCount,
  answeredCount,
  eliminationMode,
  onToggleEliminationMode,
  onEndRound,
  onNextRound,
  onOpenHistory,
  onAnnounceScores,
}) => {
  const [showEndRoundConfirm, setShowEndRoundConfirm] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (question.trim() && !isProcessing) {
        onSubmit();
      }
    }
  };

  const handleEndRound = () => {
    setShowEndRoundConfirm(false);
    onEndRound();
  };

  return (
    <>
      {/* Main Console */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Decorative top border with glow */}
        <div className="h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-glow-pulse" />

        <div className="bg-gradient-to-t from-slate-950 via-slate-900/98 to-slate-900/95 backdrop-blur-md border-t border-purple-500/30">
          <div className="max-w-7xl mx-auto p-4">
            {/* Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                {/* Round Badge */}
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500 blur-md opacity-50 rounded-full" />
                  <div className="relative badge badge-lg bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white font-bold px-4 py-3">
                    <span className="font-display">ROUND {currentRound}</span>
                  </div>
                </div>

                {/* Question Count */}
                <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{questionCount} question{questionCount !== 1 ? 's' : ''}</span>
                </div>

                {/* Live Processing Indicator */}
                {isProcessing && (
                  <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full animate-pulse">
                    <span className="loading loading-dots loading-xs"></span>
                    <span className="text-sm font-medium">{answeredCount}/{activeContestantCount} responding</span>
                  </div>
                )}
              </div>

              {/* Elimination Mode Indicator */}
              {eliminationMode && (
                <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full border border-red-500/50 animate-pulse">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-bold text-sm">ELIMINATION MODE</span>
                </div>
              )}
            </div>

            {/* Input Row */}
            <div className="flex gap-3 items-stretch">
              {/* Question Input with glow effect */}
              <div className="flex-1 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 group-focus-within:opacity-60 transition duration-300" />
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the celebrities a question... (Ctrl/Cmd + Enter to submit)"
                  disabled={isProcessing}
                  maxLength={500}
                  className="relative w-full h-16 md:h-20 resize-none bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Ask Button */}
              <button
                onClick={onSubmit}
                disabled={!question.trim() || isProcessing}
                className={`
                  relative min-w-[100px] md:min-w-[140px] rounded-xl font-display font-bold text-lg tracking-wider uppercase transition-all duration-300
                  ${!question.trim() || isProcessing
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] hover:scale-105 active:scale-95'
                  }
                `}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="loading loading-ring loading-md"></span>
                    <span className="text-xs">LIVE</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                    </svg>
                    <span className="text-xs">ASK</span>
                  </div>
                )}
              </button>
            </div>

            {/* Control Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/50">
              {/* Left Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Elimination Toggle */}
                <button
                  onClick={onToggleEliminationMode}
                  className={`btn btn-sm gap-2 transition-all ${
                    eliminationMode
                      ? 'btn-error animate-pulse'
                      : 'btn-outline btn-error hover:animate-none'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span className="hidden sm:inline">{eliminationMode ? 'Cancel' : 'Eliminate'}</span>
                </button>

                {/* Announce Scores */}
                <button
                  onClick={onAnnounceScores}
                  disabled={isProcessing}
                  className="btn btn-sm btn-outline btn-info gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  <span className="hidden sm:inline">Announce</span>
                </button>

                {/* History */}
                <button
                  onClick={onOpenHistory}
                  className="btn btn-sm btn-ghost gap-2 text-slate-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">History</span>
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                {/* End Round */}
                <button
                  onClick={() => setShowEndRoundConfirm(true)}
                  disabled={isProcessing}
                  className="btn btn-sm btn-warning gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  <span className="hidden sm:inline">End Round</span>
                </button>

                {/* Next Round */}
                <button
                  onClick={onNextRound}
                  disabled={isProcessing}
                  className="btn btn-sm btn-success gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  <span className="hidden sm:inline">Next Round</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* End Round Confirmation Modal */}
      {showEndRoundConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowEndRoundConfirm(false)}
          />
          <div className="relative bg-slate-900 rounded-2xl border border-amber-500/50 p-6 max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-zoom-in">
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2 font-display">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              End Round {currentRound}?
            </h3>
            <p className="text-slate-300 mb-4">
              This will finalize all scores and answers for Round {currentRound}. A report will be generated.
            </p>
            <div className="bg-slate-800 rounded-xl p-4 mb-4">
              <div className="flex justify-between text-slate-400 mb-2">
                <span>Questions asked:</span>
                <span className="text-white font-bold">{questionCount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active contestants:</span>
                <span className="text-white font-bold">{activeContestantCount}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEndRoundConfirm(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleEndRound}
                className="btn btn-warning gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                End Round
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
