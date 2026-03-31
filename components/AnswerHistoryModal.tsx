import React, { useState } from 'react';
import { Round, Contestant } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rounds: Round[];
  contestants: Contestant[];
}

export const AnswerHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  rounds,
  contestants,
}) => {
  const [selectedRound, setSelectedRound] = useState<number>(
    rounds.length > 0 ? rounds[rounds.length - 1].roundNumber : 1
  );
  const [expandedAnswer, setExpandedAnswer] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentRoundData = rounds.find(r => r.roundNumber === selectedRound);
  const getContestant = (id: string) => contestants.find(c => c.id === id);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-2xl border-2 border-purple-500/30 w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ANSWER HISTORY
            </h2>
            <p className="text-sm text-slate-400">
              Review all questions and answers from each round
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-circle btn-ghost"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Round Tabs */}
        {rounds.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-800 flex gap-2 overflow-x-auto">
            {rounds.map((round) => (
              <button
                key={round.roundNumber}
                onClick={() => setSelectedRound(round.roundNumber)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                  ${selectedRound === round.roundNumber
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }
                `}
              >
                Round {round.roundNumber}
                <span className="ml-2 text-xs opacity-70">
                  ({round.questions.length} Q)
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!currentRoundData || currentRoundData.questions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-slate-400 text-lg">No questions asked yet in this round</p>
              <p className="text-slate-500 text-sm mt-2">
                Ask a question from the Quizmaster Console to see answers here
              </p>
            </div>
          ) : (
            currentRoundData.questions.map((question, qIndex) => (
              <div
                key={question.id}
                className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
              >
                {/* Question Header */}
                <div className="bg-purple-900/30 border-l-4 border-purple-500 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-purple-400 mb-1">
                        Question {qIndex + 1} - {formatTime(question.askedAt)}
                      </div>
                      <p className="text-lg font-semibold text-white">{question.text}</p>
                    </div>
                    <div className="badge badge-purple ml-4">
                      {question.answers.length} answers
                    </div>
                  </div>
                </div>

                {/* Answers Grid */}
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {question.answers.map((answer) => {
                      const contestant = getContestant(answer.contestantId);
                      if (!contestant) return null;

                      const isExpanded = expandedAnswer === `${question.id}-${answer.contestantId}`;

                      return (
                        <div
                          key={answer.contestantId}
                          className={`
                            bg-slate-900/60 rounded-lg border border-slate-700 p-3
                            hover:border-purple-500/50 transition-all cursor-pointer
                            ${contestant.eliminated ? 'opacity-50' : ''}
                          `}
                          onClick={() => setExpandedAnswer(isExpanded ? null : `${question.id}-${answer.contestantId}`)}
                        >
                          {/* Contestant Header */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xl ${contestant.eliminated ? 'grayscale' : ''}`}>
                              {contestant.persona.avatar}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${contestant.eliminated ? 'line-through text-slate-500' : 'text-white'}`}>
                                {contestant.persona.name}
                              </p>
                            </div>
                            {answer.score !== undefined && answer.score > 0 && (
                              <div className="badge badge-success badge-sm">
                                +{answer.score}
                              </div>
                            )}
                          </div>

                          {/* Answer Text */}
                          <p className={`text-sm text-slate-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                            {answer.text}
                          </p>

                          {answer.text.length > 150 && (
                            <button className="text-xs text-purple-400 mt-2 hover:text-purple-300">
                              {isExpanded ? '▲ Show less' : '▼ Read full answer'}
                            </button>
                          )}

                          <div className="text-xs text-slate-500 mt-2">
                            {formatTime(answer.submittedAt)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 px-6 py-3 bg-slate-900">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              {rounds.length} round{rounds.length !== 1 ? 's' : ''} •{' '}
              {rounds.reduce((acc, r) => acc + r.questions.length, 0)} total questions
            </span>
            <button
              onClick={onClose}
              className="btn btn-sm btn-ghost"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
