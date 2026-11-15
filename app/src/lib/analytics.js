// Product analytics: fire-and-forget events to our backend (POST /api/events → Supabase `events`).
// Never blocks or breaks the UI; failures are ignored.
import { BACKEND } from './api.js';
import { K, store } from './storage.js';

const SESSION_KEY = 'claudio_analytics_session';

/** Anonymous id for this browser session, to join events from the same visit. */
function sessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2));
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function track(name, props = {}) {
  try {
    // text/plain + no custom headers = a "simple" CORS request (no preflight), so `keepalive`
    // delivers it even when the page navigates away right after (e.g. into checkout).
    // The session token goes in the body for the same reason.
    fetch(BACKEND + '/api/events', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ name, props, session: sessionId(), lang: document.documentElement.lang || null, token: store.get(K.token) || undefined }),
    }).catch(() => {});
  } catch { /* analytics must never break the app */ }
}
