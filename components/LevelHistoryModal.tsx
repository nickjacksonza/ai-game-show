import React from 'react';

interface LevelHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: { level: number; content: string; timestamp: string }[];
}

export const LevelHistoryModal: React.FC<LevelHistoryModalProps> = ({ isOpen, onClose, reports }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
        
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
          <h2 className="text-xl font-display font-bold text-white">Level Archives</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {reports.length === 0 ? (
            <div className="text-center text-slate-500 italic py-10">
              No levels completed yet. Finish a level to generate a report.
            </div>
          ) : (
            reports.slice().reverse().map((report) => (
              <div key={report.level} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                  <span className="font-display font-bold text-blue-400">Level {report.level}</span>
                  <span className="text-xs font-mono text-slate-500">{report.timestamp}</span>
                </div>
                <pre className="p-4 text-xs sm:text-sm font-mono text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                  {report.content}
                </pre>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-right">
            <button 
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors"
            >
                Close Archive
            </button>
        </div>
      </div>
    </div>
  );
};
