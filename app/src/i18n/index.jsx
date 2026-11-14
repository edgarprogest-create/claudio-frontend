import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from './en.json';
import pt from './pt.json';
import es from './es.json';
import fr from './fr.json';

// Strings are keyed by their English text; en.json only holds overrides.
const DICTS = { en, pt, es, fr };
export const LANGS = [
  { id: 'pt', label: 'Português', locale: 'pt-PT' },
  { id: 'en', label: 'English', locale: 'en-GB' },
  { id: 'es', label: 'Español', locale: 'es-ES' },
  { id: 'fr', label: 'Français', locale: 'fr-FR' },
];
const DEFAULT_LANG = 'pt';
const KEY = 'claudio_lang';

function initialLang() {
  const saved = localStorage.getItem(KEY);
  return DICTS[saved] ? saved : DEFAULT_LANG;
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
  useEffect(() => {
    localStorage.setItem(KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);
  const value = useMemo(() => {
    const info = LANGS.find(l => l.id === lang);
    return { lang, setLang: setLangState, t: s => translate(lang, s), locale: info.locale, langLabel: info.label };
  }, [lang]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);
