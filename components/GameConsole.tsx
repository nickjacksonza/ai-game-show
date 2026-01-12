import React, { useState } from 'react';

interface Props {
  currentRound: number;
  questionCount: number;
  activeContestantCount: number;
  answeredCount: number;
  scoresLocked: boolean;
  eliminationMode: boolean;
  isProcessing: boolean;
  onAskQuestion: (question: string) => void;
  onToggleEliminationMode: () => void;
  onEndRound: () => void;
  onStartNewRound: () => void;
  onOpenHistory: () => void;
}

export const GameConsole: React.FC<Props> = ({
  currentRound,
  questionCount,
  activeContestantCount,
  answeredCount,
  scoresLocked,
  eliminationMode,
  isProcessing,
  onAskQuestion,
  onToggleEliminationMode,
  onEndRound,
  onStartNewRound,
  onOpenHistory,
}) => {
  const [question, setQuestion] = useState('');
  const [showEndRoundConfirm, setShowEndRoundConfirm] = useState(false);

  const handleSubmit = () => {
    if (!question.trim() || isProcessing) return;
    onAskQuestion(question.trim());
    setQuestion('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const handleEndRound = () => {
    setShowEndRoundConfirm(false);
    onEndRound();
  };

  return (
    <>
      {/* Main Console */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-900/98 to-slate-900/95 border-t-2 border-purple-500/50 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto p-4">
          {/* Status Bar */}
          <div className="flex items-center justify-between mb-3 text-sm">
            <div className="flex items-center gap-4">
              <div className="badge badge-lg badge-primary font-bold">
                Round {currentRound}
              </div>
              <span className="text-slate-400">
                {questionCount} question{questionCount !== 1 ? 's' : ''} asked
              </span>
              {isProcessing && (
                <div className="flex items-center gap-2 text-amber-400">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>{answeredCount}/{activeContestantCount} answered</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {eliminationMode && (
                <span className="text-red-400 font-medium animate-pulse">
                  Elimination Mode Active
                </span>
              )}
            </div>
          </div>

          {/* Input Row */}
          <div className="flex gap-3 items-end">
            {/* Question Input */}
            <div className="flex-1">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question to all contestants... (Ctrl/Cmd + Enter to submit)"
                disabled={isProcessing}
                className="textarea textarea-bordered w-full h-16 resize-none bg-slate-800 border-slate-600 focus:border-purple-500 placeholder-slate-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleSubmit}
                disabled={!question.trim() || isProcessing}
                className="btn btn-primary btn-lg gap-2 min-w-[140px]"
              >
                {isProcessing ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Asking...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                    </svg>
                    Ask All
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Control Row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
            {/* Left Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleEliminationMode}
                className={`btn btn-sm gap-2 ${
                  eliminationMode
                    ? 'btn-error'
                    : 'btn-outline btn-error'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                {eliminationMode ? 'Cancel Elimination' : 'Eliminate'}
              </button>

              <button
                onClick={onOpenHistory}
                className="btn btn-sm btn-ghost gap-2 text-slate-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEndRoundConfirm(true)}
                disabled={isProcessing}
                className="btn btn-sm btn-warning gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                End Round {currentRound}
              </button>

              <button
                onClick={onStartNewRound}
                disabled={!scoresLocked || isProcessing}
                className="btn btn-sm btn-success gap-2"
                title={!scoresLocked ? 'Lock scores before starting new round' : ''}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                New Round
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* End Round Confirmation Modal */}
      {showEndRoundConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowEndRoundConfirm(false)}
          />
          <div className="relative bg-slate-900 rounded-xl border border-amber-500/50 p-6 max-w-md w-full shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              End Round {currentRound}?
            </h3>
            <p className="text-slate-300 mb-4">
              This will finalize all scores and answers for Round {currentRound}.
              {!scoresLocked && ' Scores will be automatically locked.'}
            </p>
            <div className="bg-slate-800 rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Questions asked:</span>
                <span className="text-white font-medium">{questionCount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active contestants:</span>
                <span className="text-white font-medium">{activeContestantCount}</span>
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
                className="btn btn-warning"
              >
                End Round
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
