import crypto from 'crypto';
import { config } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
}

function getMasterKey(): Buffer {
  const key = config.encryption.masterKey;
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_MASTER_KEY must be at least 32 characters');
  }
  return crypto.hkdfSync('sha256', key, 'ai-game-show-salt', 'api-key-encryption', KEY_LENGTH);
}

export function encryptApiKey(plaintext: string): EncryptedData {
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

export function decryptApiKey(encrypted: EncryptedData): string {
  const key = getMasterKey();
  const iv = Buffer.from(encrypted.iv, 'base64');
  const authTag = Buffer.from(encrypted.authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let plaintext = decipher.update(encrypted.ciphertext, 'base64', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}
