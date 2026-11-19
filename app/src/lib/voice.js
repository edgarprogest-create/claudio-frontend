// Voice mode with the browser's own speech APIs (no backend):
// SpeechRecognition to listen, speechSynthesis to speak.

export const getRecognition = () => window.SpeechRecognition || window.webkitSpeechRecognition || null;

/** Both halves are needed: Firefox has speechSynthesis but no SpeechRecognition. */
export const voiceSupported = () => !!getRecognition() && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';

let unlocked = false;
/**
 * iPhone Safari only lets speechSynthesis speak after it was first used inside a tap.
 * Call this from a tap handler (opening voice mode, the first tap on the orb).
 */
export function unlockSpeech() {
  if (unlocked || !('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
    unlocked = true;
  } catch { /* ignore */ }
}

/** Best voice for a locale like "pt-PT": exact match first, then same language (pt-BR), else none (browser default). */
export function pickVoice(locale) {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  const norm = s => String(s || '').replace('_', '-').toLowerCase();
  const want = norm(locale);
  const lang = want.split('-')[0];
  const exact = voices.filter(v => norm(v.lang) === want);
  const same = voices.filter(v => norm(v.lang).split('-')[0] === lang);
  const pool = exact.length ? exact : same;
  return pool.find(v => v.localService) || pool[0] || null;
}

// Voices load asynchronously in Chrome; touching getVoices() early fills the list.
if ('speechSynthesis' in window) {
  try { window.speechSynthesis.getVoices(); window.speechSynthesis.addEventListener?.('voiceschanged', () => window.speechSynthesis.getVoices()); } catch { /* ignore */ }
}

/** Markdown → plain speech text (no asterisks, hashes, code fences or link URLs read aloud). */
export function speakable(md) {
  return String(md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/[*_~>|]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits text into sentence-sized chunks: Chrome stops long utterances after ~15 seconds,
 * so a long reply is spoken as a queue of short ones.
 */
export function chunks(text, max = 220) {
  const parts = text.match(/[^.!?…]+[.!?…]+["'”»)]*\s*|[^.!?…]+$/g) || [text];
  const out = [];
  let cur = '';
  for (const p of parts) {
    if ((cur + p).length > max && cur) { out.push(cur.trim()); cur = ''; }
    if (p.length > max) {
      for (let i = 0; i < p.length; i += max) out.push(p.slice(i, i + max).trim());
    } else cur += p;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}
