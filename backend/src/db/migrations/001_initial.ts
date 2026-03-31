import type Database from 'better-sqlite3';

export function up(db: Database.Database): void {
  db.exec(`
    -- Users table (populated from OAuth)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      provider TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(provider, provider_id)
    );

    -- Encrypted API keys per user per provider
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      provider TEXT NOT NULL,
      encrypted_key TEXT NOT NULL,
      iv TEXT NOT NULL,
      auth_tag TEXT NOT NULL,
      base_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, provider)
    );

    -- Game sessions
    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      status TEXT DEFAULT 'in_progress',
      contestants_config TEXT NOT NULL,
      final_scores TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions(user_id, created_at DESC);

    -- Session logs (Q&A rounds)
    CREATE TABLE IF NOT EXISTS session_logs (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      level INTEGER NOT NULL,
      round INTEGER NOT NULL,
      question TEXT NOT NULL,
      answers TEXT NOT NULL,
      scores TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_session_logs_session ON session_logs(session_id, level, round);

    -- Level reports
    CREATE TABLE IF NOT EXISTS level_reports (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      level INTEGER NOT NULL,
      report_content TEXT NOT NULL,
      level_scores TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(session_id, level)
    );

    -- Migrations tracking
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function down(db: Database.Database): void {
  db.exec(`
    DROP TABLE IF EXISTS level_reports;
    DROP TABLE IF EXISTS session_logs;
    DROP TABLE IF EXISTS game_sessions;
    DROP TABLE IF EXISTS api_keys;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS migrations;
  `);
}
