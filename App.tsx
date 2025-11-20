import React, { useState, useRef } from 'react';
import { Contestant, GeminiModel } from './types';
import { DEFAULT_PERSONAS, APP_VERSION } from './constants';
import { ContestantPodium } from './components/ContestantPodium';
import { QuizmasterConsole } from './components/QuizmasterConsole';
import { Scoreboard } from './components/Scoreboard';
import { LevelHistoryModal } from './components/LevelHistoryModal';
import { createContestantChat, getChatResponse, Chat } from './services/geminiService';

// Structure to track Q&A logs
interface SessionLogEntry {
  question: string;
  answers: Record<string, string>; // contestantId -> answer
}

// Structure for the "Text File" report
interface LevelReport {
  level: number;
  content: string;
  timestamp: string;
}

const App: React.FC = () => {
  // Initialize 3 contestants based on default personas
  const [contestants, setContestants] = useState<Contestant[]>(() => 
    DEFAULT_PERSONAS.map((persona) => ({
      id: persona.id,
      persona: persona,
      selectedModel: GeminiModel.FLASH_LITE,
      currentAnswer: '',
      isThinking: false,
      score: 0,
      apiKey: '',
    }))
  );

  // Stores scores for the CURRENT active level only
  const [scores, setScores] = useState<Record<string, Record<number, number | string>>>({});
  
  // State for Level management
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelHistory, setLevelHistory] = useState<{level: number, totals: Record<string, number>}[]>([]);
  
  // New: Store generated reports (the "Text Files")
  const [levelReports, setLevelReports] = useState<LevelReport[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // New: Store the Q&A log for the current level
  const [sessionLog, setSessionLog] = useState<SessionLogEntry[]>([]);

  const [question, setQuestion] = useState('');
  const [isRoundActive, setIsRoundActive] = useState(false);

  // Store chat sessions in a ref to persist them without triggering re-renders
  const chatSessions = useRef<Record<string, Chat>>({});

  // Derived state for rendering: Merges history + current level scores
  const contestantsWithScores = contestants.map(c => {
      // Current level total
      const cScores = scores[c.id] || {};
      const currentLevelTotal = [1, 2, 3].reduce((acc, r) => acc + (Number(cScores[r]) || 0), 0);
      
      // History total
      const historyTotal = levelHistory.reduce((acc, h) => acc + (h.totals[c.id] || 0), 0);

      return { ...c, score: currentLevelTotal + historyTotal };
  });

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsRoundActive(true);
    
    // Clear previous answers and set thinking state
    setContestants(prev => prev.map(c => ({
      ...c,
      currentAnswer: '',
      isThinking: true
    })));

    // Temporary storage for answers to log them later
    const currentAnswers: Record<string, string> = {};

    // Trigger all API calls in parallel
    const promises = contestants.map(async (contestant) => {
      let chat = chatSessions.current[contestant.id];

      // Initialize chat session if it doesn't exist
      if (!chat) {
        chat = createContestantChat(
          contestant.selectedModel,
          contestant.persona.systemInstruction,
          contestant.apiKey
        );
        chatSessions.current[contestant.id] = chat;
      }

      const answer = await getChatResponse(chat, question);
      currentAnswers[contestant.id] = answer;

      // Update individual contestant when their promise resolves
      setContestants(prev => prev.map(c => 
        c.id === contestant.id 
          ? { ...c, currentAnswer: answer, isThinking: false }
          : c
      ));
    });

    await Promise.all(promises);

    // Log the interaction
    setSessionLog(prev => [...prev, {
      question: question,
      answers: currentAnswers
    }]);

    setIsRoundActive(false);
    setQuestion(''); // Clear input for next round
  };

  const handleUpdateSettings = (id: string, updates: Partial<Contestant>) => {
    setContestants(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));

    // If settings change (like persona, model, or apiKey), invalidate the chat session
    // so it gets recreated with new settings on the next turn.
    if (updates.persona || updates.selectedModel || updates.apiKey !== undefined) {
      delete chatSessions.current[id];
    }
  };

  const handleScoreChange = (id: string, round: number, value: string) => {
    setScores(prev => {
        const next = { ...prev };
        if (!next[id]) next[id] = {};
        next[id][round] = value;
        return next;
    });
  };

  const handleNextLevel = () => {
    // 1. Calculate totals for current level
    const currentLevelTotals: Record<string, number> = {};
    contestants.forEach(c => {
      const s = scores[c.id] || {};
      currentLevelTotals[c.id] = [1, 2, 3].reduce((acc, r) => acc + (Number(s[r]) || 0), 0);
    });

    // 2. Archive current level totals for scoring logic
    setLevelHistory(prev => [...prev, { level: currentLevel, totals: currentLevelTotals }]);

    // 3. Generate "Text File" Report
    const reportDate = new Date().toLocaleString();
    let reportContent = `GEMINI GAME SHOW - LEVEL ${currentLevel} REPORT\n`;
    reportContent += `Generated: ${reportDate}\n`;
    reportContent += `================================================\n\n`;
    
    reportContent += `FINAL SCORES (LEVEL ${currentLevel}):\n`;
    contestants.forEach(c => {
      const s = scores[c.id] || {};
      const r1 = s[1] || 0;
      const r2 = s[2] || 0;
      const r3 = s[3] || 0;
      reportContent += `- ${c.persona.name}: R1[${r1}] + R2[${r2}] + R3[${r3}] = ${currentLevelTotals[c.id]} pts\n`;
    });

    reportContent += `\nTRANSCRIPT OF ROUNDS:\n`;
    reportContent += `------------------------------------------------\n`;
    
    if (sessionLog.length === 0) {
      reportContent += `(No questions recorded this level)\n`;
    } else {
      sessionLog.forEach((entry, index) => {
        reportContent += `\n[Q${index + 1}] QUIZMASTER: ${entry.question}\n`;
        contestants.forEach(c => {
          const answer = entry.answers[c.id] || "(No Answer)";
          reportContent += `   > ${c.persona.name}: ${answer}\n`;
        });
      });
    }

    // Save the report
    setLevelReports(prev => [...prev, {
      level: currentLevel,
      content: reportContent,
      timestamp: reportDate
    }]);
    
    // 4. Reset inputs for next level
    setScores({});
    setSessionLog([]); // Clear session log
    setCurrentLevel(prev => prev + 1);
  };

  const handleAnnounceScores = async () => {
    // Determine which round we are announcing (latest round with data)
    let activeRound = 1;
    for (let r = 3; r >= 1; r--) {
        const hasData = contestants.some(c => scores[c.id]?.[r] !== undefined && scores[c.id]?.[r] !== '');
        if (hasData) {
            activeRound = r;
            break;
        }
    }

    setIsRoundActive(true);
    setContestants(prev => prev.map(c => ({ ...c, isThinking: true })));

    const promises = contestants.map(async (c) => {
        let chat = chatSessions.current[c.id];
        if (!chat) {
            chat = createContestantChat(c.selectedModel, c.persona.systemInstruction, c.apiKey);
            chatSessions.current[c.id] = chat;
        }

        const roundScore = Number(scores[c.id]?.[activeRound]) || 0;
        const cScores = scores[c.id] || {};
        const currentLevelTotal = [1, 2, 3].reduce((acc, r) => acc + (Number(cScores[r]) || 0), 0);
        const historyTotal = levelHistory.reduce((acc, h) => acc + (h.totals[c.id] || 0), 0);
        const grandTotal = currentLevelTotal + historyTotal;
        
        const prompt = `
[SYSTEM NOTICE: SCORING UPDATE]
The round (Level ${currentLevel} - Round ${activeRound}) has ended.
Judges have awarded you: ${roundScore} points for this round.
Your current GRAND TOTAL Score is: ${grandTotal}.

INSTRUCTION: React to this score in character. 
If the score is low (0-4), be disappointed, defensive, or angry. 
If average (5-7), be accepting or hopeful. 
If high (8-10), be excited, smug, or grateful.
Keep the response short (under 20 words).
`;
        const answer = await getChatResponse(chat, prompt);

        setContestants(prev => prev.map(curr => 
            curr.id === c.id 
                ? { ...curr, currentAnswer: answer, isThinking: false }
                : curr
        ));
    });

    await Promise.all(promises);
    setIsRoundActive(false);
  };

  const handleBroadcastLevelAnswers = async () => {
    if (sessionLog.length === 0) return;

    setIsRoundActive(true);
    setContestants(prev => prev.map(c => ({ ...c, isThinking: true })));

    const promises = contestants.map(async (c) => {
      let chat = chatSessions.current[c.id];
      if (!chat) {
          chat = createContestantChat(c.selectedModel, c.persona.systemInstruction, c.apiKey);
          chatSessions.current[c.id] = chat;
      }

      // Compile a personalized summary for this AI
      let summary = `[SYSTEM NOTICE: LEVEL ${currentLevel} RECAP]\nHere is a summary of the questions asked this level and YOUR answers:\n\n`;
      
      sessionLog.forEach((entry, i) => {
        const myAnswer = entry.answers[c.id] || "No answer given.";
        summary += `Q${i+1}: ${entry.question}\nYOU: ${myAnswer}\n\n`;
      });

      // Calculate current level score
      const cScores = scores[c.id] || {};
      const currentLevelTotal = [1, 2, 3].reduce((acc, r) => acc + (Number(cScores[r]) || 0), 0);
      
      summary += `Your Total Score for this Level: ${currentLevelTotal}.\n`;
      summary += `INSTRUCTION: Provide a short closing statement (under 25 words) about your performance in this Level based on the answers and score above. Stay in character.`;

      const answer = await getChatResponse(chat, summary);

      setContestants(prev => prev.map(curr => 
        curr.id === c.id 
          ? { ...curr, currentAnswer: answer, isThinking: false }
          : curr
      ));
    });

    await Promise.all(promises);
    setIsRoundActive(false);
  };

  return (
    <div className="min-h-screen flex flex-col pb-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      
      {/* Header / Logo Area */}
      <header className="pt-8 pb-4 text-center">
        <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_2px_10px_rgba(168,85,247,0.5)]">
          Gemini Game Show
        </h1>
        <div className="flex items-center justify-center gap-4 mt-2">
            <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
            3 Models • 1 Quizmaster • v{APP_VERSION}
            </p>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
        
        {/* Contestant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[400px] mb-12">
          {contestantsWithScores.map((contestant) => (
            <div key={contestant.id} className="h-full flex flex-col">
                <ContestantPodium 
                    contestant={contestant} 
                    onUpdateSettings={handleUpdateSettings}
                />
            </div>
          ))}
        </div>

        {/* Scoreboard */}
        <Scoreboard 
            contestants={contestantsWithScores}
            scores={scores}
            levelHistory={levelHistory}
            currentLevel={currentLevel}
            onScoreChange={handleScoreChange}
            onAnnounce={handleAnnounceScores}
            onBroadcastRecap={handleBroadcastLevelAnswers}
            onNextLevel={handleNextLevel}
            onOpenHistory={() => setIsHistoryOpen(true)}
            isProcessing={isRoundActive}
        />

      </main>

      {/* Console */}
      <QuizmasterConsole 
        question={question}
        setQuestion={setQuestion}
        onSubmit={handleAskQuestion}
        isProcessing={isRoundActive}
      />

      {/* History Modal */}
      <LevelHistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        reports={levelReports} 
      />
    </div>
  );
};

export default App;