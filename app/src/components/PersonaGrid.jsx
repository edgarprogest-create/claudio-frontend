import { useI18n } from '../i18n/index.jsx';
import { PERSONAS } from '../data/personas.js';

export default function PersonaGrid({ current, isUnlocked, onPick }) {
  const { t } = useI18n();
  return (
    <div className="persona-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {Object.entries(PERSONAS).map(([id, m]) => {
        const sel = id === current, open = isUnlocked(id);
        return (
          <div key={id} role="button" data-tap onClick={() => onPick(id, open)}
            className={`persona-card${open ? '' : ' locked'}${sel ? ' sel' : ''}`}
            style={{ '--p': m.color, background: sel ? 'var(--accent-soft)' : 'var(--surface)', borderColor: sel ? 'var(--accent)' : 'var(--border)' }}>
            <div className="pc-glyph" style={{ fontSize: 24, color: sel || open ? 'var(--accent)' : 'var(--faint)', lineHeight: 1, marginBottom: 10 }}>{m.glyph}</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3, letterSpacing: '-0.015em', color: open ? 'var(--text)' : 'var(--dim)' }}>{m.name}</div>
            <div style={{ fontSize: 11, color: 'var(--dim)', lineHeight: 1.35 }}>{t(m.desc)}</div>
            {sel ? <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--accent)', fontWeight: 700, fontSize: 13 }}>✓</div>
              : !open && <span className="pro-tag" style={{ position: 'absolute', top: 12, right: 12 }}>Pro</span>}
          </div>
        );
      })}
    </div>
  );
}
