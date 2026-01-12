const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: 'google' | 'github';
}

export interface ApiKeyStatus {
  provider: string;
  hasKey: boolean;
  baseUrl: string | null;
  updatedAt: string | null;
}

export interface GameSession {
  id: string;
  title: string | null;
  startedAt: string;
  endedAt: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  contestantsConfig: string;
  finalScores: string | null;
}

export interface SessionLog {
  id: string;
  level: number;
  round: number;
  question: string;
  answers: string;
  scores: string | null;
  timestamp: string;
}

interface ChatRequest {
  provider: string;
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  config?: { maxTokens?: number; temperature?: number };
}

class ApiClient {
  private token: string | null = null;
  private onAuthChange: ((user: User | null) => void) | null = null;

  constructor() {
    // Load token from localStorage on init
    this.token = localStorage.getItem('auth_token');
  }

  setAuthChangeHandler(handler: (user: User | null) => void) {
    this.onAuthChange = handler;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    this.onAuthChange?.(null);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.request(path, options);
      }
      this.clearToken();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  getAuthUrl(provider: 'google' | 'github'): string {
    return `${API_BASE}/auth/${provider}`;
  }

  async getMe(): Promise<User> {
    const { user } = await this.request<{ user: User }>('/auth/me');
    return user;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const { token } = await this.request<{ token: string }>('/auth/refresh', {
        method: 'POST',
      });
      this.setToken(token);
      return true;
    } catch {
      return false;
    }
  }

  // API Keys
  async getApiKeys(): Promise<ApiKeyStatus[]> {
    const { keys } = await this.request<{ keys: ApiKeyStatus[] }>('/keys');
    return keys;
  }

  async setApiKey(provider: string, apiKey: string, baseUrl?: string): Promise<void> {
    await this.request(`/keys/${provider}`, {
      method: 'PUT',
      body: JSON.stringify({ apiKey, baseUrl }),
    });
  }

  async deleteApiKey(provider: string): Promise<void> {
    await this.request(`/keys/${provider}`, { method: 'DELETE' });
  }

  // AI Proxy
  async chat(params: ChatRequest): Promise<{ content: string }> {
    return this.request('/proxy/chat', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Sessions
  async getSessions(page = 1, limit = 20): Promise<{ sessions: GameSession[]; total: number }> {
    return this.request(`/sessions?page=${page}&limit=${limit}`);
  }

  async getSession(id: string): Promise<{ session: GameSession; logs: SessionLog[] }> {
    return this.request(`/sessions/${id}`);
  }

  async createSession(contestantsConfig: object, title?: string): Promise<GameSession> {
    const { session } = await this.request<{ session: GameSession }>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ contestantsConfig, title }),
    });
    return session;
  }

  async updateSession(
    id: string,
    updates: { title?: string; status?: string; finalScores?: object; endedAt?: string }
  ): Promise<GameSession> {
    const { session } = await this.request<{ session: GameSession }>(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return session;
  }

  async deleteSession(id: string): Promise<void> {
    await this.request(`/sessions/${id}`, { method: 'DELETE' });
  }

  async addSessionLog(
    sessionId: string,
    level: number,
    round: number,
    question: string,
    answers: object,
    scores?: object
  ): Promise<SessionLog> {
    const { log } = await this.request<{ log: SessionLog }>(`/sessions/${sessionId}/logs`, {
      method: 'POST',
      body: JSON.stringify({ level, round, question, answers, scores }),
    });
    return log;
  }
}

export const api = new ApiClient();
