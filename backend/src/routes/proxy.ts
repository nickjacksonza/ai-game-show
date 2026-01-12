import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { getDecryptedApiKey } from '../db/repositories/apiKeys.js';
import type { ChatRequest, ChatResponse } from '../types/index.js';

// Provider implementations
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import OpenAI from 'openai';

const router = Router();

router.use(requireAuth);

router.post('/chat', async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { provider, model, messages, config: chatConfig } = req.body as ChatRequest;

  if (!provider || !model || !messages) {
    res.status(400).json({ error: 'Missing required fields: provider, model, messages' });
    return;
  }

  const keyData = getDecryptedApiKey(userId, provider);

  // Ollama doesn't require an API key
  if (!keyData && provider !== 'ollama') {
    res.status(400).json({ error: `No API key configured for ${provider}` });
    return;
  }

  try {
    let content: string;

    switch (provider) {
      case 'gemini':
        content = await handleGemini(keyData!.apiKey, model, messages, chatConfig);
        break;
      case 'openrouter':
        content = await handleOpenRouter(keyData!.apiKey, model, messages, chatConfig);
        break;
      case 'openai':
        content = await handleOpenAI(keyData!.apiKey, keyData!.baseUrl, model, messages, chatConfig);
        break;
      case 'ollama':
        content = await handleOllama(keyData?.baseUrl, model, messages, chatConfig);
        break;
      default:
        res.status(400).json({ error: `Unknown provider: ${provider}` });
        return;
    }

    res.json({ content } as ChatResponse);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'AI request failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

async function handleGemini(
  apiKey: string,
  model: string,
  messages: ChatRequest['messages'],
  chatConfig?: ChatRequest['config']
): Promise<string> {
  const client = new GoogleGenAI({ apiKey });

  const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
  const chatMessages = messages.filter((m) => m.role !== 'system');

  const chat = client.chats.create({
    model,
    config: {
      systemInstruction: systemMessage,
      maxOutputTokens: chatConfig?.maxTokens || 200,
      temperature: chatConfig?.temperature || 0.7,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    },
  });

  // Send conversation history
  for (const msg of chatMessages.slice(0, -1)) {
    await chat.sendMessage({ message: msg.content });
  }

  // Get response for the last message
  const lastMessage = chatMessages[chatMessages.length - 1];
  const response = await chat.sendMessage({ message: lastMessage.content });

  return response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '[No response]';
}

async function handleOpenRouter(
  apiKey: string,
  model: string,
  messages: ChatRequest['messages'],
  chatConfig?: ChatRequest['config']
): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-Title': 'AI Game Show',
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: chatConfig?.maxTokens || 200,
      temperature: chatConfig?.temperature || 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter error: ${error.error?.message || response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '[No response]';
}

async function handleOpenAI(
  apiKey: string,
  baseUrl: string | null,
  model: string,
  messages: ChatRequest['messages'],
  chatConfig?: ChatRequest['config']
): Promise<string> {
  const client = new OpenAI({
    apiKey,
    baseURL: baseUrl || undefined,
  });

  const completion = await client.chat.completions.create({
    model,
    messages: messages.map((m) => ({ role: m.role as 'system' | 'user' | 'assistant', content: m.content })),
    max_tokens: chatConfig?.maxTokens || 200,
    temperature: chatConfig?.temperature || 0.7,
  });

  return completion.choices[0]?.message?.content || '[No response]';
}

async function handleOllama(
  baseUrl: string | null,
  model: string,
  messages: ChatRequest['messages'],
  chatConfig?: ChatRequest['config']
): Promise<string> {
  const url = baseUrl || 'http://localhost:11434';

  const response = await fetch(`${url}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      options: {
        num_predict: chatConfig?.maxTokens || 200,
        temperature: chatConfig?.temperature || 0.7,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return data.message?.content || '[No response]';
}

export default router;
