import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../index.js';
import type { GameSession, SessionLog, LevelReport } from '../../types/index.js';

export function listSessions(
  userId: string,
  page: number = 1,
  limit: number = 20
): { sessions: GameSession[]; total: number } {
  const db = getDb();
  const offset = (page - 1) * limit;

  const sessions = db
    .prepare(
      `SELECT id, user_id as userId, title, started_at as startedAt, ended_at as endedAt,
              status, contestants_config as contestantsConfig, final_scores as finalScores,
              created_at as createdAt, updated_at as updatedAt
       FROM game_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .all(userId, limit, offset) as GameSession[];

  const { total } = db
    .prepare('SELECT COUNT(*) as total FROM game_sessions WHERE user_id = ?')
    .get(userId) as { total: number };

  return { sessions, total };
}

export function getSession(id: string, userId: string): GameSession | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, user_id as userId, title, started_at as startedAt, ended_at as endedAt,
              status, contestants_config as contestantsConfig, final_scores as finalScores,
              created_at as createdAt, updated_at as updatedAt
       FROM game_sessions WHERE id = ? AND user_id = ?`
    )
    .get(id, userId) as GameSession | undefined;
  return row || null;
}

export function createSession(
  userId: string,
  contestantsConfig: object,
  title?: string
): GameSession {
  const db = getDb();
  const id = uuidv4();

  db.prepare(
    `INSERT INTO game_sessions (id, user_id, title, contestants_config, status)
     VALUES (?, ?, ?, ?, 'in_progress')`
  ).run(id, userId, title || null, JSON.stringify(contestantsConfig));

  return getSession(id, userId)!;
}

export function updateSession(
  id: string,
  userId: string,
  updates: { title?: string; status?: string; finalScores?: object; endedAt?: string }
): GameSession | null {
  const db = getDb();

  const sets: string[] = ['updated_at = CURRENT_TIMESTAMP'];
  const values: unknown[] = [];

  if (updates.title !== undefined) {
    sets.push('title = ?');
    values.push(updates.title);
  }
  if (updates.status !== undefined) {
    sets.push('status = ?');
    values.push(updates.status);
  }
  if (updates.finalScores !== undefined) {
    sets.push('final_scores = ?');
    values.push(JSON.stringify(updates.finalScores));
  }
  if (updates.endedAt !== undefined) {
    sets.push('ended_at = ?');
    values.push(updates.endedAt);
  }

  values.push(id, userId);

  db.prepare(`UPDATE game_sessions SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`).run(
    ...values
  );

  return getSession(id, userId);
}

export function deleteSession(id: string, userId: string): boolean {
  const db = getDb();
  const result = db
    .prepare('DELETE FROM game_sessions WHERE id = ? AND user_id = ?')
    .run(id, userId);
  return result.changes > 0;
}

export function getSessionLogs(sessionId: string): SessionLog[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, session_id as sessionId, level, round, question, answers, scores, timestamp
       FROM session_logs WHERE session_id = ? ORDER BY level, round`
    )
    .all(sessionId) as SessionLog[];
}

export function addSessionLog(
  sessionId: string,
  level: number,
  round: number,
  question: string,
  answers: object,
  scores?: object
): SessionLog {
  const db = getDb();
  const id = uuidv4();

  db.prepare(
    `INSERT INTO session_logs (id, session_id, level, round, question, answers, scores)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, sessionId, level, round, question, JSON.stringify(answers), scores ? JSON.stringify(scores) : null);

  const row = db
    .prepare(
      `SELECT id, session_id as sessionId, level, round, question, answers, scores, timestamp
       FROM session_logs WHERE id = ?`
    )
    .get(id) as SessionLog;

  return row;
}

export function saveLevelReport(
  sessionId: string,
  level: number,
  reportContent: string,
  levelScores: object
): LevelReport {
  const db = getDb();
  const id = uuidv4();

  db.prepare(
    `INSERT OR REPLACE INTO level_reports (id, session_id, level, report_content, level_scores)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, sessionId, level, reportContent, JSON.stringify(levelScores));

  const row = db
    .prepare(
      `SELECT id, session_id as sessionId, level, report_content as reportContent,
              level_scores as levelScores, created_at as createdAt
       FROM level_reports WHERE session_id = ? AND level = ?`
    )
    .get(sessionId, level) as LevelReport;

  return row;
}
