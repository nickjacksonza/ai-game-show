import { Router } from 'express';
import passport from 'passport';
import { config } from '../config/index.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/jwt.js';
import { findUserById } from '../db/repositories/users.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${config.frontendUrl}/login?error=google_failed` }),
  (req, res) => {
    const user = req.user!;
    const accessToken = generateAccessToken(user as any);
    const refreshToken = generateRefreshToken(user.id);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with access token
    res.redirect(`${config.frontendUrl}/auth/callback?token=${accessToken}`);
  }
);

// GitHub OAuth
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${config.frontendUrl}/login?error=github_failed` }),
  (req, res) => {
    const user = req.user!;
    const accessToken = generateAccessToken(user as any);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${config.frontendUrl}/auth/callback?token=${accessToken}`);
  }
);

// Get current user
router.get('/me', requireAuth, (req, res) => {
  const user = findUserById((req as AuthenticatedRequest).userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});

// Refresh token
router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    res.status(401).json({ error: 'Invalid refresh token' });
    return;
  }

  const user = findUserById(payload.sub);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  const newAccessToken = generateAccessToken(user);
  res.json({ token: newAccessToken });
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true });
});

export default router;
