import React from 'react';

interface QuizmasterConsoleProps {
  question: string;
  setQuestion: (q: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
}

export const QuizmasterConsole: React.FC<QuizmasterConsoleProps> = ({
  question,
  setQuestion,
  onSubmit,
  isProcessing,
}) => {
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (question.trim() && !isProcessing) {
        onSubmit();
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 md:p-6 shadow-2xl z-10">
      <div className="max-w-6xl mx-auto w-full flex gap-4 items-end">
        <div className="flex-1 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={500}
            placeholder="Type your question here, Quizmaster..."
            className="relative block w-full bg-slate-950 text-white border border-slate-800 rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-20 sm:h-24 text-lg shadow-inner"
            disabled={isProcessing}
          />
        </div>
        
        <button
          onClick={onSubmit}
          disabled={!question.trim() || isProcessing}
          className={`
            h-20 sm:h-24 px-8 rounded-lg font-display font-bold text-xl tracking-wider uppercase transition-all duration-200
            ${!question.trim() || isProcessing 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)] transform hover:-translate-y-1'
            }
          `}
        >
          {isProcessing ? 'Live...' : 'Ask!'}
        </button>
      </div>
    </div>
  );
};