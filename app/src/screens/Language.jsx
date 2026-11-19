import { useState } from 'react';
import { useI18n, browserLang, savedLang } from '../i18n/index.jsx';

// Shown in each language's own words, so it never needs translating.
const CHOICES = [
  { id: 'en', hello: 'Hello', cta: 'Continue in English' },
  { id: 'pt', hello: 'Olá', cta: 'Continuar em português' },
  { id: 'es', hello: 'Hola', cta: 'Continuar en español' },
  { id: 'fr', hello: 'Bonjour', cta: 'Continuer en français' },
];

/**
 * First-run language picker, right after the Splash and before onboarding / sign-in.
 * The browser's language is preselected; nothing is saved until the user confirms.
 */
export default function Language({ onPick }) {
  const { setLang } = useI18n();
  const [sel, setSel] = useState(() => savedLang() || browserLang());
  const choice = CHOICES.find(c => c.id === sel) || CHOICES[0];

  const confirm = () => { setLang(choice.id); onPick(choice.id); };

  return (
    <div className="phone">
      <div className="app-pad-top"></div>
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 24px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div className="splash-dot" style={{ marginBottom: 18 }}></div>
          <div className="brand-name" style={{ fontWeight: 700, fontSize: 30, letterSpacing: '-0.045em', marginBottom: 10 }}>Claudionoid</div>
          <div className="eyebrow" style={{ color: 'var(--dim)' }}>Language · Idioma · Langue</div>
        </div>
        <div role="radiogroup" aria-label="Language · Idioma · Langue" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {CHOICES.map(c => {
            const on = c.id === sel;
            return (
              <button key={c.id} type="button" role="radio" aria-checked={on} lang={c.id} data-tap
                className={`card lang-card${on ? ' on' : ''}`} onClick={() => setSel(c.id)}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 2 }}>{c.hello}</span>
                  <span style={{ display: 'block', fontSize: 13, color: 'var(--dim)' }}>{c.cta}</span>
                </span>
                <span className="lang-check" aria-hidden="true">{on ? '✓' : ''}</span>
              </button>
            );
          })}
        </div>
        <button type="button" lang={choice.id} data-tap className="btn-primary" onClick={confirm} style={{ width: '100%', padding: 15, borderRadius: 14 }}>
          {choice.cta} →
        </button>
      </div>
    </div>
  );
}
