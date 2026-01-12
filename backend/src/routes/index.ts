import { Router } from 'express';
import authRoutes from './auth.js';
import keysRoutes from './keys.js';
import proxyRoutes from './proxy.js';
import sessionsRoutes from './sessions.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/keys', keysRoutes);
router.use('/proxy', proxyRoutes);
router.use('/sessions', sessionsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
