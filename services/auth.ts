import { api, User } from './api';

export type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

let authState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

let listeners: Array<(state: AuthState) => void> = [];

function notifyListeners() {
  listeners.forEach((listener) => listener(authState));
}

export function subscribeToAuth(listener: (state: AuthState) => void): () => void {
  listeners.push(listener);
  listener(authState);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getAuthState(): AuthState {
  return authState;
}

export async function initializeAuth(): Promise<void> {
  authState = { ...authState, isLoading: true };
  notifyListeners();

  if (!api.getToken()) {
    authState = { user: null, isLoading: false, isAuthenticated: false };
    notifyListeners();
    return;
  }

  try {
    const user = await api.getMe();
    authState = { user, isLoading: false, isAuthenticated: true };
  } catch {
    api.clearToken();
    authState = { user: null, isLoading: false, isAuthenticated: false };
  }
  notifyListeners();
}

export function handleAuthCallback(token: string): void {
  api.setToken(token);
  initializeAuth();
}

export async function logout(): Promise<void> {
  await api.logout();
  authState = { user: null, isLoading: false, isAuthenticated: false };
  notifyListeners();
}

export function loginWithGoogle(): void {
  window.location.href = api.getAuthUrl('google');
}

export function loginWithGitHub(): void {
  window.location.href = api.getAuthUrl('github');
}

// Set up auth change handler
api.setAuthChangeHandler((user) => {
  if (!user) {
    authState = { user: null, isLoading: false, isAuthenticated: false };
    notifyListeners();
  }
});
