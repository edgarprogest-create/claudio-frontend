import { K, store } from './storage.js';

export const BACKEND = 'https://claudio-production-6014.up.railway.app';

export class ApiError extends Error {
  constructor(message, status = 0) { super(message); this.status = status; }
}

const authHeaders = () => {
  const token = store.get(K.token);
  return token ? { Authorization: 'Bearer ' + token } : {};
};

async function post(path, body) {
  let res;
  try {
    res = await fetch(BACKEND + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Connection error. Try again.');
  }
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

// POST /api/auth/register {name,email,password} → { token, user? }
export async function register({ name, email, password }) {
  const { ok, data } = await post('/api/auth/register', { name, email, password });
  if (!ok) throw new ApiError(data.error || data.message || 'Error creating account');
  return { token: data.token, name: data.user?.name || name, email: data.user?.email || email };
}

// POST /api/auth/login {email,password} → { token, user? }
export async function login({ email, password }) {
  const { ok, data } = await post('/api/auth/login', { email, password });
  if (!ok) throw new ApiError(data.error || data.message || 'Invalid credentials');
  return { token: data.token, name: data.user?.name || '', email: data.user?.email || email };
}

async function getJson(path) {
  const res = await fetch(BACKEND + path, { headers: authHeaders() });
  if (!res.ok) throw new ApiError('HTTP ' + res.status, res.status);
  return res.json();
}

// GET /api/chat/usage → { plan, weeklyUsed, weeklyLimit, plan_activated_at }
export const getUsage = () => getJson('/api/chat/usage');

// GET /api/stripe/trial-status → { inTrial, trialEndsAt }
export const getTrialStatus = () => getJson('/api/stripe/trial-status');

/**
 * POST /api/chat {messages, humanoid, system, lang} — streams SSE lines `data: {text|error|done}`.
 * Calls onText(fullTextSoFar) as chunks arrive and resolves with the full reply.
 */
export async function streamChat({ messages, humanoid, system, lang, onText }) {
  let res;
  try {
    res = await fetch(BACKEND + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ messages, humanoid, system: system || undefined, lang }),
    });
  } catch {
    throw new ApiError('Connection error. Try again.');
  }

  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    if (res.status === 401) throw new ApiError('Session expired. Sign in again.', 401);
    if (res.status === 402 || res.status === 429) throw new ApiError(d.error || d.message || 'Limit reached. Upgrade your plan.', res.status);
    if (res.status === 413) throw new ApiError('File too large for the server.', 413);
    throw new ApiError(d.error || d.message || 'Something went wrong. Try again.', res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;
        let data;
        try { data = JSON.parse(raw); } catch { continue; }
        if (data.error) throw new ApiError(data.error);
        if (data.text) { full += data.text; onText?.(full); }
      }
    }
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError('Connection error. Try again.');
  }
  if (!full) throw new ApiError('Empty response.');
  return full;
}
