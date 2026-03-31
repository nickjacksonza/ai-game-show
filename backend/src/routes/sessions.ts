import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import {
  listSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  getSessionLogs,
  addSessionLog,
  saveLevelReport,
} from '../db/repositories/gameSessions.js';

const router = Router();

router.use(requireAuth);

// List user's game sessions
router.get('/', (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const { sessions, total } = listSessions(userId, page, limit);
  res.json({ sessions, total, page, limit });
});

// Create new session
router.post('/', (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { contestantsConfig, title } = req.body;

  if (!contestantsConfig) {
    res.status(400).json({ error: 'contestantsConfig is required' });
    return;
  }

  const session = createSession(userId, contestantsConfig, title);
  res.status(201).json({ session });
});

// Get session details with logs
router.get('/:id', (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id } = req.params;

  const session = getSession(id, userId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  const logs = getSessionLogs(id);
  res.json({ session, logs });
});

// Update session
router.put('/:id', (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id } = req.params;
  const { title, status, finalScores, endedAt } = req.body;

  const session = updateSession(id, userId, { title, status, finalScores, endedAt });
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json({ session });
});

// Delete session
router.delete('/:id', (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id } = req.params;

  const deleted = deleteSession(id, userId);
  if (!deleted) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json({ success: true });
});

// Add session log entry
router.post('/:id/logs', (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id } = req.params;
  const { level, round, question, answers, scores } = req.body;

  // Verify session belongs to user
  const session = getSession(id, userId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  if (!level || !round || !question || !answers) {
    res.status(400).json({ error: 'Missing required fields: level, round, question, answers' });
    return;
  }

  const log = addSessionLog(id, level, round, question, answers, scores);
  res.status(201).json({ log });
});

// Save level report
router.post('/:id/levels/:level/report', (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id, level } = req.params;
  const { reportContent, levelScores } = req.body;

  const session = getSession(id, userId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  if (!reportContent || !levelScores) {
    res.status(400).json({ error: 'Missing required fields: reportContent, levelScores' });
    return;
  }

  const report = saveLevelReport(id, parseInt(level), reportContent, levelScores);
  res.status(201).json({ report });
});

export default router;
