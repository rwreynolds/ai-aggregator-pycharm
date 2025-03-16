import { Message, Thread, UserSettings, ServiceMap, Assistant, ChatRequest } from '../types';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Helper for making authenticated API requests
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const session = await getSession();

  if (!session) {
    throw new Error('No active session');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${session.token}`,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

// User settings
export async function fetchUserSettings(): Promise<UserSettings> {
  return fetchWithAuth('/settings');
}

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  return fetchWithAuth('/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}

// Services and models
export async function fetchServices(): Promise<ServiceMap> {
  return fetchWithAuth('/services');
}

export async function fetchAssistants(): Promise<Assistant[]> {
  return fetchWithAuth('/assistants');
}

// Messages and chat
export async function fetchMessages(threadId?: string): Promise<Message[]> {
  const endpoint = threadId
    ? `/messages?thread_id=${encodeURIComponent(threadId)}`
    : '/messages';
  return fetchWithAuth(endpoint);
}

export async function sendMessage(request: ChatRequest): Promise<Message> {
  return fetchWithAuth('/chat', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Threads
export async function fetchThreads(): Promise<Thread[]> {
  return fetchWithAuth('/threads');
}

// Auth methods (for direct API calls)
export async function registerUser(userData: { name: string, email: string, password: string }) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
}