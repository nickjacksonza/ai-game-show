import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../index.js';
import { encryptApiKey, decryptApiKey } from '../../services/encryption.js';
import type { ApiKey, ApiKeyStatus } from '../../types/index.js';

const PROVIDERS = ['gemini', 'openrouter', 'openai', 'ollama'] as const;

export function getApiKeyStatuses(userId: string): ApiKeyStatus[] {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT provider, base_url as baseUrl, updated_at as updatedAt
       FROM api_keys WHERE user_id = ?`
    )
    .all(userId) as Array<{ provider: string; baseUrl: string | null; updatedAt: string }>;

  const keyMap = new Map(rows.map((r) => [r.provider, r]));

  return PROVIDERS.map((provider) => {
    const existing = keyMap.get(provider);
    return {
      provider,
      hasKey: !!existing,
      baseUrl: existing?.baseUrl || null,
      updatedAt: existing?.updatedAt || null,
    };
  });
}

export function setApiKey(
  userId: string,
  provider: string,
  apiKey: string,
  baseUrl?: string
): void {
  const db = getDb();

  const encrypted = encryptApiKey(apiKey);

  const existing = db
    .prepare('SELECT id FROM api_keys WHERE user_id = ? AND provider = ?')
    .get(userId, provider);

  if (existing) {
    db.prepare(
      `UPDATE api_keys SET encrypted_key = ?, iv = ?, auth_tag = ?, base_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ? AND provider = ?`
    ).run(encrypted.ciphertext, encrypted.iv, encrypted.authTag, baseUrl || null, userId, provider);
  } else {
    const id = uuidv4();
    db.prepare(
      `INSERT INTO api_keys (id, user_id, provider, encrypted_key, iv, auth_tag, base_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, userId, provider, encrypted.ciphertext, encrypted.iv, encrypted.authTag, baseUrl || null);
  }
}

export function deleteApiKey(userId: string, provider: string): boolean {
  const db = getDb();
  const result = db
    .prepare('DELETE FROM api_keys WHERE user_id = ? AND provider = ?')
    .run(userId, provider);
  return result.changes > 0;
}

export function getDecryptedApiKey(
  userId: string,
  provider: string
): { apiKey: string; baseUrl: string | null } | null {
  const db = getDb();

  const row = db
    .prepare(
      `SELECT encrypted_key as encryptedKey, iv, auth_tag as authTag, base_url as baseUrl
       FROM api_keys WHERE user_id = ? AND provider = ?`
    )
    .get(userId, provider) as
    | { encryptedKey: string; iv: string; authTag: string; baseUrl: string | null }
    | undefined;

  if (!row) {
    return null;
  }

  const apiKey = decryptApiKey({
    ciphertext: row.encryptedKey,
    iv: row.iv,
    authTag: row.authTag,
  });

  return { apiKey, baseUrl: row.baseUrl };
}
