import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../index.js';
import type { User } from '../../types/index.js';

interface CreateUserInput {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: 'google' | 'github';
  providerId: string;
}

export function findUserById(id: string): User | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, email, display_name as displayName, avatar_url as avatarUrl,
              provider, provider_id as providerId, created_at as createdAt, updated_at as updatedAt
       FROM users WHERE id = ?`
    )
    .get(id) as User | undefined;
  return row || null;
}

export function findUserByProviderId(provider: string, providerId: string): User | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, email, display_name as displayName, avatar_url as avatarUrl,
              provider, provider_id as providerId, created_at as createdAt, updated_at as updatedAt
       FROM users WHERE provider = ? AND provider_id = ?`
    )
    .get(provider, providerId) as User | undefined;
  return row || null;
}

export function findOrCreateUser(input: CreateUserInput): User {
  const db = getDb();

  const existing = findUserByProviderId(input.provider, input.providerId);
  if (existing) {
    // Update user info on each login
    db.prepare(
      `UPDATE users SET email = ?, display_name = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(input.email, input.displayName, input.avatarUrl, existing.id);

    return {
      ...existing,
      email: input.email,
      displayName: input.displayName,
      avatarUrl: input.avatarUrl,
    };
  }

  const id = uuidv4();
  db.prepare(
    `INSERT INTO users (id, email, display_name, avatar_url, provider, provider_id)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, input.email, input.displayName, input.avatarUrl, input.provider, input.providerId);

  return findUserById(id)!;
}
