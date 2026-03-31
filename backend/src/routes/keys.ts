import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import {
  getApiKeyStatuses,
  setApiKey,
  deleteApiKey,
  getDecryptedApiKey,
} from '../db/repositories/apiKeys.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// List API key statuses (never returns actual keys)
router.get('/', (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const keys = getApiKeyStatuses(userId);
  res.json({ keys });
});

// Set/update API key for a provider
router.put('/:provider', (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { provider } = req.params;
  const { apiKey, baseUrl } = req.body;

  const validProviders = ['gemini', 'openrouter', 'openai', 'ollama'];
  if (!validProviders.includes(provider)) {
    res.status(400).json({ error: 'Invalid provider' });
    return;
  }

  if (!apiKey || typeof apiKey !== 'string') {
    res.status(400).json({ error: 'API key is required' });
    return;
  }

  setApiKey(userId, provider, apiKey, baseUrl);
  res.json({ success: true });
});

// Delete API key for a provider
router.delete('/:provider', (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { provider } = req.params;

  const deleted = deleteApiKey(userId, provider);
  if (!deleted) {
    res.status(404).json({ error: 'API key not found' });
    return;
  }

  res.json({ success: true });
});

// Check if key exists and test connection (optional endpoint)
router.get('/:provider/status', (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { provider } = req.params;

  const keyData = getDecryptedApiKey(userId, provider);
  res.json({
    provider,
    hasKey: !!keyData,
    baseUrl: keyData?.baseUrl || null,
  });
});

export default router;
