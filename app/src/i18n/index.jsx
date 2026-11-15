import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from './en.json';
import pt from './pt.json';
import es from './es.json';
import fr from './fr.json';

// Strings are keyed by their English text; en.json only holds overrides.
const DICTS = { en, pt, es, fr };
export const LANGS = [
  { id: 'en', label: 'English', locale: 'en-GB' },
  { id: 'pt', label: 'Português', locale: 'pt-PT' },
  { id: 'es', label: 'Español', locale: 'es-ES' },
  { id: 'fr', label: 'Français', locale: 'fr-FR' },
];
const DEFAULT_LANG = 'en';
const KEY = 'claudio_lang';

/** First supported language in the browser's preferences, else English. */
export function browserLang() {
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
  for (const p of prefs) {
    const code = String(p).slice(0, 2).toLowerCase();
    if (DICTS[code]) return code;
  }
  return DEFAULT_LANG;
}

/** The language the user chose, if any. Only an explicit choice is ever saved. */
export const savedLang = () => {
  const saved = localStorage.getItem(KEY);
  return DICTS[saved] ? saved : null;
};

// Same rule as the pre-paint script in index.html.
const initialLang = () => savedLang() || browserLang();

/** Page language for the browser (no "Translate this page?") and assistive tech. */
function applyDocumentLang(lang) {
  document.documentElement.lang = lang;
  document.querySelector('meta[http-equiv="Content-Language"]')?.setAttribute('content', lang);
}

export function translate(lang, s) {
  if (typeof s !== 'string') return s;
  return DICTS[lang]?.[s] ?? en[s] ?? s;
}

// Lets non-React code (e.g. toast) translate with the active language.
let currentLang = initialLang();
export const tr = s => translate(currentLang, s);

const I18nCtx = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang);
  currentLang = lang;
  useEffect(() => { applyDocumentLang(lang); }, [lang]);
  const value = useMemo(() => {
    const info = LANGS.find(l => l.id === lang);
    // setLang is only called on an explicit user choice (language picker, Settings), so it saves.
    // Nothing else writes claudio_lang: the app never switches language on its own.
    const setLang = id => {
      if (!DICTS[id]) return;
      localStorage.setItem(KEY, id);
      setLangState(id);
    };
    return { lang, setLang, t: s => translate(lang, s), locale: info.locale, langLabel: info.label };
  }, [lang]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);
