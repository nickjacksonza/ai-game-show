import React from 'react';
import { Contestant } from '../types';

interface ScoreboardProps {
  contestants: Contestant[]; // These contestants have the GRAND TOTAL score in .score property
  scores: Record<string, Record<number, number | string>>; // Scores for CURRENT level
  levelHistory: { level: number; totals: Record<string, number> }[];
  currentLevel: number;
  onScoreChange: (contestantId: string, round: number, value: string) => void;
  onAnnounce: () => void;
  onBroadcastRecap: () => void;
  onNextLevel: () => void;
  onOpenHistory: () => void;
  isProcessing: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  contestants,
  scores,
  levelHistory,
  currentLevel,
  onScoreChange,
  onAnnounce,
  onBroadcastRecap,
  onNextLevel,
  onOpenHistory,
  isProcessing,
}) => {
  const rounds = [1, 2, 3];

  // Prevent invalid chars in number inputs (e, E, +, -)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-8 bg-slate-900/90 border border-slate-700 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
      <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex flex-col xl:flex-row justify-between items-center gap-4">
        <div>
            <h3 className="text-lg font-display font-bold text-white tracking-wide flex items-center gap-2">
              Judge's Scorecard 
              <span className="bg-blue-900 text-blue-200 text-xs px-2 py-0.5 rounded border border-blue-700 font-mono uppercase">
                Level {currentLevel}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Rate answers 1-10. Enter scores for the current level rounds.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-center xl:justify-end">
          {/* Scores Broadcast */}
          <button
            onClick={onAnnounce}
            disabled={isProcessing}
            title="Announce the current round's scores to the contestants and get their reactions."
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]"
          >
            {isProcessing ? 'Busy...' : '📢 Scores'}
          </button>

          {/* Recap Broadcast */}
          <button
            onClick={onBroadcastRecap}
            disabled={isProcessing}
            className="bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            title="Broadcast all questions and answers from this level to the contestants for a summary."
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            Level Recap
          </button>

          {/* History Viewer */}
          <button
            onClick={onOpenHistory}
            title="View the text file archives of questions and answers from previous levels."
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            History
          </button>
          
          {/* Next Level */}
          <button
            onClick={onNextLevel}
            disabled={isProcessing}
            title="Finalize the current level, save the transcript, and start a fresh level."
            className="bg-emerald-700 hover:bg-emerald-600 text-emerald-50 border border-emerald-600 hover:border-emerald-500 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            Next Level
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/50 text-xs uppercase font-bold text-slate-500 tracking-wider">
            <tr>
              <th className="px-6 py-4 min-w-[200px]">Contestant</th>
              
              {/* History Columns */}
              {levelHistory.map(h => (
                <th key={h.level} className="px-4 py-4 text-center text-slate-600 whitespace-nowrap">
                   L{h.level} Total
                </th>
              ))}

              {/* Current Rounds */}
              {rounds.map(r => (
                <th key={r} className="px-4 py-4 text-center text-blue-400 whitespace-nowrap">
                  R{r}
                </th>
              ))}
              
              <th className="px-6 py-4 text-right text-yellow-500 whitespace-nowrap">Grand Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {contestants.map(c => (
              <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-white">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl bg-slate-800 w-10 h-10 flex items-center justify-center rounded-full border border-slate-700 shadow-inner shrink-0">
                        {c.persona.avatar}
                    </span>
                    <span className="font-display truncate">{c.persona.name}</span>
                  </div>
                </td>

                {/* History Data */}
                {levelHistory.map(h => (
                   <td key={h.level} className="px-4 py-4 text-center text-slate-500 font-mono">
                      {h.totals[c.id] || 0}
                   </td>
                ))}

                {/* Current Round Inputs */}
                {rounds.map(r => (
                  <td key={r} className="px-4 py-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      onKeyDown={handleKeyDown}
                      value={scores[c.id]?.[r] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Validating input to be between 0-10 or empty
                        if (val === '' || (Number(val) >= 0 && Number(val) <= 10)) {
                            onScoreChange(c.id, r, val);
                        }
                      }}
                      className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-center text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-lg"
                    />
                  </td>
                ))}

                {/* Grand Total */}
                <td className="px-6 py-4 text-right font-bold text-yellow-400 text-xl font-mono tabular-nums">
                  {c.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};