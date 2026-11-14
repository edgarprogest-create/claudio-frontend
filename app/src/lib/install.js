// PWA install: keeps the browser's beforeinstallprompt event so the app can show its own Install button.
// Imported from main.jsx before React mounts, because Chrome can fire the event very early.
import { useEffect, useState } from 'react';

const DISMISS_KEY = 'claudio_install_dismissed';

let deferred = null; // the beforeinstallprompt event, while the browser allows prompting
let installed = isStandalone();
const listeners = new Set();
const emit = () => listeners.forEach(fn => fn());

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); // keep Chrome's mini-infobar away; we show our own UI
  deferred = e;
  emit();
});
window.addEventListener('appinstalled', () => {
  deferred = null;
  installed = true;
  emit();
});
window.matchMedia?.('(display-mode: standalone)').addEventListener?.('change', ev => {
  if (ev.matches) { installed = true; emit(); }
});

/** 'ios' for iPhone/iPad (incl. iPadOS that reports as Mac), otherwise 'android'. */
export function detectPlatform() {
  const ua = navigator.userAgent || '';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return 'ios';
  return 'android';
}

/** Shows the native install prompt. Resolves to 'accepted', 'dismissed' or 'unavailable'. */
export async function promptInstall() {
  if (!deferred) return 'unavailable';
  const e = deferred;
  deferred = null; // an event can only be prompted once
  emit();
  await e.prompt();
  const { outcome } = await e.userChoice;
  if (outcome === 'accepted') { installed = true; emit(); }
  return outcome;
}

export function useInstall() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force(n => n + 1);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);
  return {
    installed,
    canPrompt: !!deferred,
    dismissed: localStorage.getItem(DISMISS_KEY) === '1',
    dismiss: () => { localStorage.setItem(DISMISS_KEY, '1'); emit(); },
  };
}
