import React, { useState, useEffect } from 'react';
import { api, GameSession } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  currentSessionId: string | null;
}

export const GameHistorySidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectSession,
  currentSessionId,
}) => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, page]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { sessions: loadedSessions, total: totalCount } = await api.getSessions(page, 20);
      setSessions(loadedSessions);
      setTotal(totalCount);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm('Delete this game session?')) return;

    try {
      await api.deleteSession(sessionId);
      await loadSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">In Progress</span>;
      case 'completed':
        return <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">Completed</span>;
      default:
        return <span className="text-xs px-1.5 py-0.5 bg-slate-500/20 text-slate-400 rounded">{status}</span>;
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-slate-900 border-r border-slate-700 z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Game History</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-400">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                <p>No saved games yet</p>
                <p className="text-sm mt-1">Sign in to save your game sessions</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {sessions.map((session) => {
                  const config = JSON.parse(session.contestantsConfig);
                  const title = session.title || `Game ${session.id.slice(0, 8)}`;

                  return (
                    <button
                      key={session.id}
                      onClick={() => onSelectSession(session.id)}
                      className={`w-full text-left p-4 hover:bg-slate-800 transition-colors group ${
                        currentSessionId === session.id ? 'bg-slate-800' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-white truncate pr-2">{title}</h3>
                        <button
                          onClick={(e) => handleDelete(e, session.id)}
                          className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{formatDate(session.startedAt)}</span>
                        {getStatusBadge(session.status)}
                      </div>
                      <div className="mt-2 flex gap-1">
                        {config?.slice(0, 3).map((c: any, i: number) => (
                          <span key={i} className="text-lg" title={c.persona?.name}>
                            {c.persona?.avatar || '?'}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="p-4 border-t border-slate-700 flex justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-sm text-slate-400 hover:text-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="text-sm text-slate-400 hover:text-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
