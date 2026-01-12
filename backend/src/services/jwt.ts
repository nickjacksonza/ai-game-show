import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { JwtPayload, User } from '../types/index.js';

export function generateAccessToken(user: User): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    displayName: user.displayName,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessTokenExpiry,
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshTokenExpiry }
  );
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { sub: string } | null {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret) as { sub: string; type: string };
    if (payload.type !== 'refresh') {
      return null;
    }
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
