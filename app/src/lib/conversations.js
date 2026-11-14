import { normalizePersona } from '../data/personas.js';

// Same key + shape as the old index.html so history carries over:
// { id, title, messages: [{role, content}], updatedAt, humanoid }
// New optional fields: notes: [{ at, persona }] ("Switched to X" lines, never sent to the API),
// and per-message `attachments: [{ name, type }]` for display.
const KEY = 'claudio_convs';
const MAX = 50;

export function loadConversations() {
  let raw;
  try { raw = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { raw = []; }
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(c => c && c.id && Array.isArray(c.messages))
    .map(c => ({ ...c, humanoid: normalizePersona(c.humanoid), notes: c.notes || [] }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

/** Replace base64 attachment data with a text placeholder (used when storage is full). */
function stripAttachments(c) {
  return {
    ...c,
    messages: c.messages.map(m => {
      if (!Array.isArray(m.content)) return m;
      let i = 0;
      const names = (m.attachments || []).map(a => a.name);
      return { ...m, content: m.content.map(b => (b.type === 'text' ? b : { type: 'text', text: `[${names[i++] || b.name || b.type}]` })) };
    }),
  };
}

export function saveConversations(convs) {
  const list = convs.filter(c => c.messages.length).slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Quota exceeded (images are big): keep the text, drop attachment bytes.
    try { localStorage.setItem(KEY, JSON.stringify(list.map(stripAttachments))); } catch { /* give up silently */ }
  }
}

/** Plain text of a message (content may be a string or an array of blocks). */
export function messageText(m) {
  if (!m) return '';
  if (typeof m.content === 'string') return m.content;
  if (Array.isArray(m.content)) return m.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
  return '';
}

export function messageAttachments(m) {
  if (m.attachments) return m.attachments;
  if (!Array.isArray(m.content)) return [];
  return m.content.filter(b => b.type !== 'text').map(b => ({ name: b.name || (b.type === 'image' ? 'image' : 'file'), type: b.type }));
}

export function lastLine(c) {
  const m = c.messages[c.messages.length - 1];
  const txt = messageText(m);
  return (txt.split('\n').find(l => l.trim()) || '').replace(/[*#`_>]/g, '').trim()
    || messageAttachments(m || {}).map(a => a.name).join(', ');
}

export function makeTitle(text) {
  const s = (text || '').replace(/\s+/g, ' ').trim();
  return s.length > 40 ? s.slice(0, 40).trimEnd() + '…' : s;
}

const startOfDay = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); };

/** 'Today' | 'Yesterday' | localised date (e.g. "14 mar."). */
export function dayGroup(ts, locale) {
  const today = startOfDay(Date.now());
  const day = startOfDay(ts || 0);
  if (day === today) return 'Today';
  if (day === today - 86400000) return 'Yesterday';
  return new Date(ts).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

export const clock = (ts, locale) => new Date(ts || 0).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

/** HH:MM today, otherwise short date. */
export function shortWhen(ts, locale) {
  return startOfDay(ts || 0) === startOfDay(Date.now()) ? clock(ts, locale) : new Date(ts || 0).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}
