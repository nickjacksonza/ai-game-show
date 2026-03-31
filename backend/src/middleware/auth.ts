import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/jwt.js';
import { findUserById } from '../db/repositories/users.js';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  const user = findUserById(payload.sub);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  (req as AuthenticatedRequest).userId = payload.sub;
  next();
}
