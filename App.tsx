import React, { useState, useRef, useEffect } from 'react';
import { Contestant, ChatSession, ContestantStatus, Round, Question, Answer } from './types';
import { DEFAULT_PERSONAS, DEFAULT_AI_CONFIG, APP_VERSION } from './constants';
import { ContestantGrid } from './components/ContestantGrid';
import { QuizmasterConsole } from './components/QuizmasterConsole';
import { EliminationModal } from './components/EliminationModal';
import { AnswerHistoryModal } from './components/AnswerHistoryModal';
import { ScoreboardSidebar } from './components/ScoreboardSidebar';
import { LevelHistoryModal } from './components/LevelHistoryModal';
import { AuthButton } from './components/AuthButton';
import { ApiKeysModal } from './components/ApiKeysModal';
import { GameHistorySidebar } from './components/GameHistorySidebar';
import { ContestantSettingsModal } from './components/ContestantSettingsModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { SetupPage } from './components/SetupPage';
import { createChatSession, getChatResponse } from './services/aiService';
import { buildScoringPrompt, DEFAULT_GAME_RULES } from './services/prompts';
import { initializeAuth, handleAuthCallback, subscribeToAuth, AuthState } from './services/auth';
import { ProviderConfigs, loadProviderConfigs, DEFAULT_PROVIDER_CONFIGS } from './services/providerConfig';

interface LevelReport {
  level: number;
  content: string;
  timestamp: string;
}

type GameStatus = 'setup' | 'active' | 'ended';

const App: React.FC = () => {
  // Game status - start in setup mode
  const [gameStatus, setGameStatus] = useState<GameStatus>('setup');
  const [providerConfigs, setProviderConfigs] = useState<ProviderConfigs>(DEFAULT_PROVIDER_CONFIGS);

  // Initialize contestants with new status field
  const [contestants, setContestants] = useState<Contestant[]>(() =>
    DEFAULT_PERSONAS.slice(0, 9).map((persona) => ({
      id: persona.id,
      persona: persona,
      aiConfig: { ...DEFAULT_AI_CONFIG },
      currentAnswer: '',
      status: 'idle' as ContestantStatus,
      score: 0,
      eliminated: false,
    }))
  );

  // Game state
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [question, setQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [eliminationMode, setEliminationMode] = useState(false);
  const [scoresLocked, setScoresLocked] = useState(false);
  const [contestantToEliminate, setContestantToEliminate] = useState<Contestant | null>(null);

  // UI state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLevelHistoryOpen, setIsLevelHistoryOpen] = useState(false);
  const [levelReports, setLevelReports] = useState<LevelReport[]>([]);
  const [showScoreboard, setShowScoreboard] = useState(true);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);

  // Settings state
  const [gameRules, setGameRules] = useState(DEFAULT_GAME_RULES);
  const [isGameSettingsOpen, setIsGameSettingsOpen] = useState(false);
  const [contestantToEdit, setContestantToEdit] = useState<Contestant | null>(null);

  // Auth state
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const [isApiKeysOpen, setIsApiKeysOpen] = useState(false);
  const [isGameHistoryOpen, setIsGameHistoryOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const chatSessions = useRef<Record<string, ChatSession>>({});

  // Initialize auth on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (window.location.pathname === '/auth/callback' && token) {
      handleAuthCallback(token);
      window.history.replaceState({}, '', '/');
    } else {
      initializeAuth();
    }

    return subscribeToAuth(setAuth);
  }, []);

  // Computed values
  const activeContestants = contestants.filter(c => !c.eliminated);
  const answeredCount = contestants.filter(c => c.status === 'answered').length;
  const questionCount = rounds.reduce((acc, r) => acc + r.questions.length, 0) +
    (currentQuestion ? 1 : 0);

  // Ask question to all active contestants
  const handleAskQuestion = async () => {
    if (!question.trim() || isProcessing) return;

    setIsProcessing(true);

    // Create new question
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: question.trim(),
      askedAt: Date.now(),
      answers: [],
    };
    setCurrentQuestion(newQuestion);

    // Set all active contestants to thinking
    setContestants(prev =>
      prev.map(c => ({
        ...c,
        currentAnswer: '',
        status: c.eliminated ? 'eliminated' : 'thinking' as ContestantStatus,
      }))
    );

    // Get responses from all active contestants
    const promises = activeContestants.map(async (contestant) => {
      let chat = chatSessions.current[contestant.id];

      if (!chat) {
        // Get API key from provider config if not set per-contestant
        const providerConfig = providerConfigs[contestant.aiConfig.provider];
        const aiConfigWithAuth = {
          ...contestant.aiConfig,
          auth: {
            ...contestant.aiConfig.auth,
            apiKey: contestant.aiConfig.auth.apiKey || providerConfig?.apiKey || '',
            baseUrl: contestant.aiConfig.auth.baseUrl || providerConfig?.baseUrl,
          },
        };
        chat = createChatSession(aiConfigWithAuth, contestant.persona, gameRules);
        chatSessions.current[contestant.id] = chat;
      }

      try {
        const answer = await getChatResponse(chat, question);

        const answerObj: Answer = {
          contestantId: contestant.id,
          text: answer,
          submittedAt: Date.now(),
        };

        // Update question with answer
        setCurrentQuestion(prev => prev ? {
          ...prev,
          answers: [...prev.answers, answerObj],
        } : null);

        // Update contestant
        setContestants(prev =>
          prev.map(c =>
            c.id === contestant.id
              ? { ...c, currentAnswer: answer, status: 'answered' as ContestantStatus }
              : c
          )
        );
      } catch (error) {
        console.error(`Error getting response from ${contestant.persona.name}:`, error);
        setContestants(prev =>
          prev.map(c =>
            c.id === contestant.id
              ? { ...c, currentAnswer: 'Error getting response', status: 'answered' as ContestantStatus }
              : c
          )
        );
      }
    });

    await Promise.all(promises);
    setIsProcessing(false);
    setQuestion('');
  };

  // Eliminate a contestant
  const handleEliminate = (id: string) => {
    const contestant = contestants.find(c => c.id === id);
    if (contestant && !contestant.eliminated) {
      setContestantToEliminate(contestant);
    }
  };

  const confirmElimination = () => {
    if (!contestantToEliminate) return;

    setContestants(prev =>
      prev.map(c =>
        c.id === contestantToEliminate.id
          ? { ...c, eliminated: true, eliminatedInRound: currentRound, status: 'eliminated' as ContestantStatus }
          : c
      )
    );

    // Clear chat session
    delete chatSessions.current[contestantToEliminate.id];

    setContestantToEliminate(null);
    setEliminationMode(false);
  };

  // Update contestant score
  const handleUpdateScore = (id: string, delta: number) => {
    if (scoresLocked) return;

    setContestants(prev =>
      prev.map(c =>
        c.id === id ? { ...c, score: Math.max(0, c.score + delta) } : c
      )
    );
  };

  // View contestant answer
  const handleViewAnswer = (contestant: Contestant) => {
    setSelectedContestant(contestant);
  };

  // End current round
  const handleEndRound = () => {
    // Save current question to round if exists
    if (currentQuestion && currentQuestion.answers.length > 0) {
      const newRound: Round = {
        roundNumber: currentRound,
        questions: [currentQuestion],
        startTime: Date.now(),
        endTime: Date.now(),
        eliminatedContestants: contestants.filter(c => c.eliminatedInRound === currentRound).map(c => c.id),
      };

      setRounds(prev => {
        const existingRoundIndex = prev.findIndex(r => r.roundNumber === currentRound);
        if (existingRoundIndex >= 0) {
          const updated = [...prev];
          updated[existingRoundIndex] = {
            ...updated[existingRoundIndex],
            questions: [...updated[existingRoundIndex].questions, currentQuestion],
            endTime: Date.now(),
          };
          return updated;
        }
        return [...prev, newRound];
      });
    }

    // Generate level report
    const reportDate = new Date().toLocaleString();
    let reportContent = `AI CELEBRITY SQUARES - ROUND ${currentRound} REPORT\n`;
    reportContent += `Generated: ${reportDate}\n`;
    reportContent += `================================================\n\n`;

    reportContent += `FINAL SCORES (ROUND ${currentRound}):\n`;
    contestants
      .sort((a, b) => b.score - a.score)
      .forEach((c, i) => {
        const status = c.eliminated ? ' (ELIMINATED)' : '';
        reportContent += `${i + 1}. ${c.persona.name}: ${c.score} pts${status}\n`;
      });

    setLevelReports(prev => [
      ...prev,
      {
        level: currentRound,
        content: reportContent,
        timestamp: reportDate,
      },
    ]);

    setScoresLocked(true);
    setCurrentQuestion(null);
  };

  // Start next round
  const handleNextRound = () => {
    // Reset for new round
    setContestants(prev =>
      prev.map(c => ({
        ...c,
        currentAnswer: '',
        status: c.eliminated ? 'eliminated' : 'idle' as ContestantStatus,
      }))
    );

    setCurrentRound(prev => prev + 1);
    setScoresLocked(false);
    setCurrentQuestion(null);
  };

  // Announce scores to contestants
  const handleAnnounceScores = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setContestants(prev => prev.map(c => ({
      ...c,
      status: c.eliminated ? 'eliminated' : 'thinking' as ContestantStatus
    })));

    const promises = activeContestants.map(async (c) => {
      let chat = chatSessions.current[c.id];
      if (!chat) {
        // Get API key from provider config if not set per-contestant
        const providerConfig = providerConfigs[c.aiConfig.provider];
        const aiConfigWithAuth = {
          ...c.aiConfig,
          auth: {
            ...c.aiConfig.auth,
            apiKey: c.aiConfig.auth.apiKey || providerConfig?.apiKey || '',
            baseUrl: c.aiConfig.auth.baseUrl || providerConfig?.baseUrl,
          },
        };
        chat = createChatSession(aiConfigWithAuth, c.persona, gameRules);
        chatSessions.current[c.id] = chat;
      }

      const prompt = buildScoringPrompt(c.score, c.score, currentRound, 1);
      const answer = await getChatResponse(chat, prompt);

      setContestants(prev =>
        prev.map(curr =>
          curr.id === c.id
            ? { ...curr, currentAnswer: answer, status: 'answered' as ContestantStatus }
            : curr
        )
      );
    });

    await Promise.all(promises);
    setIsProcessing(false);
  };

  // Lock scores
  const handleLockScores = () => {
    setScoresLocked(true);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsGameHistoryOpen(false);
  };

  // Open contestant settings
  const handleOpenContestantSettings = (contestant: Contestant) => {
    setContestantToEdit(contestant);
  };

  // Save contestant settings
  const handleSaveContestantSettings = (id: string, updates: Partial<Contestant>) => {
    setContestants(prev =>
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    );
    // Clear chat session so it recreates with new settings
    delete chatSessions.current[id];
  };

  // Save game rules
  const handleSaveGameRules = (rules: string) => {
    setGameRules(rules);
    // Clear all chat sessions so they recreate with new rules
    chatSessions.current = {};
  };

  // Start game from setup page
  const handleStartGame = (
    setupContestants: Contestant[],
    setupGameRules: string,
    setupProviderConfigs: ProviderConfigs
  ) => {
    setContestants(setupContestants);
    setGameRules(setupGameRules);
    setProviderConfigs(setupProviderConfigs);
    chatSessions.current = {};
    setGameStatus('active');
  };

  // Return to setup
  const handleReturnToSetup = () => {
    setGameStatus('setup');
    setCurrentRound(1);
    setRounds([]);
    setCurrentQuestion(null);
    setScoresLocked(false);
    chatSessions.current = {};
    setContestants(prev =>
      prev.map(c => ({
        ...c,
        currentAnswer: '',
        status: 'idle' as ContestantStatus,
        score: 0,
        eliminated: false,
        eliminatedInRound: undefined,
      }))
    );
  };

  // Show setup page if in setup mode
  if (gameStatus === 'setup') {
    return <SetupPage onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen flex flex-col stage-lights">
      {/* Header */}
      <header className="relative z-10 pt-4 pb-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Back to Setup & Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReturnToSetup}
              className="btn btn-ghost btn-sm gap-2 text-slate-400 hover:text-purple-400"
              title="Back to Setup"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Setup
            </button>
            <button
              onClick={() => setIsGameHistoryOpen(true)}
              className="btn btn-ghost btn-circle"
              title="Game History"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Center: Title */}
          <div className="text-center flex-1">
            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 glow-text animate-spotlight">
                AI Celebrity Squares
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mt-1">
              <span className="text-purple-400">★</span> Where AI Meets Entertainment <span className="text-purple-400">★</span> v{APP_VERSION}
            </p>
          </div>

          {/* Right: Settings & Auth */}
          <div className="flex items-center gap-2">
            {/* Game Settings */}
            <button
              onClick={() => setIsGameSettingsOpen(true)}
              className="btn btn-ghost btn-circle text-slate-400 hover:text-purple-400"
              title="Game Settings"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {/* Toggle Scoreboard */}
            <button
              onClick={() => setShowScoreboard(!showScoreboard)}
              className={`btn btn-ghost btn-circle ${showScoreboard ? 'text-purple-400' : 'text-slate-500'}`}
              title="Toggle Scoreboard"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            {auth.isAuthenticated && (
              <button
                onClick={() => setIsApiKeysOpen(true)}
                className="btn btn-ghost btn-circle"
                title="API Keys"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </button>
            )}
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 flex pb-48">
        {/* Celebrity Squares Grid */}
        <div className={`flex-1 p-4 md:p-6 transition-all duration-300 ${showScoreboard ? 'lg:pr-80' : ''}`}>
          <ContestantGrid
            contestants={contestants}
            eliminationMode={eliminationMode}
            scoresLocked={scoresLocked}
            onEliminate={handleEliminate}
            onViewAnswer={handleViewAnswer}
            onUpdateScore={handleUpdateScore}
            onOpenSettings={handleOpenContestantSettings}
          />
        </div>

        {/* Scoreboard Sidebar */}
        {showScoreboard && (
          <div className="hidden lg:block fixed right-0 top-0 bottom-48 w-80 animate-slide-up">
            <ScoreboardSidebar
              contestants={contestants}
              currentRound={currentRound}
              scoresLocked={scoresLocked}
              onLockScores={handleLockScores}
              onOpenHistory={() => setIsHistoryOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Quizmaster Console */}
      <QuizmasterConsole
        question={question}
        setQuestion={setQuestion}
        onSubmit={handleAskQuestion}
        isProcessing={isProcessing}
        currentRound={currentRound}
        questionCount={questionCount}
        activeContestantCount={activeContestants.length}
        answeredCount={answeredCount}
        eliminationMode={eliminationMode}
        onToggleEliminationMode={() => setEliminationMode(!eliminationMode)}
        onEndRound={handleEndRound}
        onNextRound={handleNextRound}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onAnnounceScores={handleAnnounceScores}
      />

      {/* Elimination Confirmation Modal */}
      <EliminationModal
        contestant={contestantToEliminate}
        currentRound={currentRound}
        onConfirm={confirmElimination}
        onCancel={() => {
          setContestantToEliminate(null);
          setEliminationMode(false);
        }}
      />

      {/* Answer History Modal */}
      <AnswerHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        rounds={rounds}
        contestants={contestants}
      />

      {/* Level History Modal (Reports) */}
      <LevelHistoryModal
        isOpen={isLevelHistoryOpen}
        onClose={() => setIsLevelHistoryOpen(false)}
        reports={levelReports}
      />

      {/* API Keys Modal */}
      <ApiKeysModal
        isOpen={isApiKeysOpen}
        onClose={() => setIsApiKeysOpen(false)}
      />

      {/* Game History Sidebar */}
      <GameHistorySidebar
        isOpen={isGameHistoryOpen}
        onClose={() => setIsGameHistoryOpen(false)}
        onSelectSession={handleSelectSession}
        currentSessionId={currentSessionId}
      />

      {/* Contestant Settings Modal */}
      <ContestantSettingsModal
        contestant={contestantToEdit}
        onClose={() => setContestantToEdit(null)}
        onSave={handleSaveContestantSettings}
      />

      {/* Game Settings Modal */}
      <GameSettingsModal
        isOpen={isGameSettingsOpen}
        onClose={() => setIsGameSettingsOpen(false)}
        gameRules={gameRules}
        onSave={handleSaveGameRules}
      />

      {/* Selected Contestant Answer Overlay */}
      {selectedContestant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedContestant(null)}
          />
          <div className="relative bg-slate-900 rounded-2xl border-2 border-purple-500/50 p-6 max-w-2xl w-full shadow-[0_0_50px_rgba(168,85,247,0.3)] animate-zoom-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-4xl ring-4 ring-purple-500/30">
                {selectedContestant.persona.avatar}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedContestant.persona.name}</h3>
                <p className="text-sm text-slate-400">{selectedContestant.aiConfig.model}</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-3xl font-black text-purple-400">{selectedContestant.score}</div>
                <div className="text-xs text-slate-500">points</div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 max-h-80 overflow-y-auto">
              <p className="text-slate-300 whitespace-pre-wrap">{selectedContestant.currentAnswer || 'No answer yet'}</p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setSelectedContestant(null)}
                className="btn btn-ghost"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
