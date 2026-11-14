import { useI18n } from '../i18n/index.jsx';

// Shown in each language's own words, so it never needs translating.
const CHOICES = [
  { id: 'en', hello: 'Hello', cta: 'Continue in English' },
  { id: 'pt', hello: 'Olá', cta: 'Continuar em português' },
  { id: 'es', hello: 'Hola', cta: 'Continuar en español' },
  { id: 'fr', hello: 'Bonjour', cta: 'Continuer en français' },
];

/** First-run language picker, right after the Splash. */
export default function Language({ onPick }) {
  const { setLang } = useI18n();
  return (
    <div className="phone">
      <div className="app-pad-top"></div>
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 24px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div className="splash-dot" style={{ marginBottom: 18 }}></div>
          <div style={{ fontWeight: 700, fontSize: 30, letterSpacing: '-0.045em', marginBottom: 10 }}>Claudionoid</div>
          <div className="eyebrow" style={{ color: 'var(--dim)' }}>Language · Idioma · Langue</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CHOICES.map(c => (
            <button key={c.id} type="button" lang={c.id} data-tap className="card lang-card" onClick={() => { setLang(c.id); onPick(c.id); }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 2 }}>{c.hello}</span>
                <span style={{ display: 'block', fontSize: 13, color: 'var(--dim)' }}>{c.cta}</span>
              </span>
              <span aria-hidden="true" style={{ color: 'var(--accent)', fontSize: 18, fontWeight: 700 }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
