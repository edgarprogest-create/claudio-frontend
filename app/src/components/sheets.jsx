import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { PERSONAS, REPLIES } from '../data/personas.js';
import { Eyebrow, Hi, PrimaryBtn, Sheet } from './ui.jsx';
import PersonaGrid from './PersonaGrid.jsx';

export function LockedSheet({ id, onClose, goPlans }) {
  const { t } = useI18n();
  const m = PERSONAS[id];
  return (
    <Sheet onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 34, color: 'var(--accent)', lineHeight: 1 }}>{m.glyph}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em' }}>{m.name}</div>
          <div style={{ fontSize: 13, color: 'var(--dim)' }}>{t(m.desc)}</div>
        </div>
      </div>
      <Eyebrow style={{ marginBottom: 8 }}>{t('Sounds like')}</Eyebrow>
      <div className="bubble ai" style={{ maxWidth: '100%', marginBottom: 20 }}>{t(REPLIES[id])}</div>
      <PrimaryBtn full onClick={() => { onClose(); goPlans(); }} style={{ borderRadius: 14, padding: 14, marginBottom: 8 }}>{t('Unlock with Advanced · 24h free')}</PrimaryBtn>
      <button data-tap onClick={onClose} className="btn-ghost" style={{ width: '100%' }}>{t('Not now')}</button>
    </Sheet>
  );
}

export function RenameSheet({ value, onSave, onClose }) {
  const { t } = useI18n();
  const [v, setV] = useState(value);
  const save = () => { if (v.trim()) { onSave(v.trim()); onClose(); } };
  return (
    <Sheet onClose={onClose}>
      <Eyebrow style={{ marginBottom: 12 }}>{t('Rename conversation')}</Eyebrow>
      <input className="field" autoFocus value={v} onChange={e => setV(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()}
        maxLength={80} style={{ width: '100%', marginBottom: 12 }}/>
      <PrimaryBtn full onClick={save} style={{ borderRadius: 14, padding: 14 }}>{t('Save')}</PrimaryBtn>
    </Sheet>
  );
}

export function HumanoidSheet({ current, isUnlocked, onPick, onClose }) {
  const { t } = useI18n();
  return (
    <Sheet onClose={onClose} tall>
      <Eyebrow style={{ marginBottom: 6 }}>{t('✦ Humanoid')}</Eyebrow>
      <div className="display" style={{ fontSize: 26, marginBottom: 18 }}>{t('Who should')} <Hi>{t('answer?')}</Hi></div>
      <PersonaGrid current={current} isUnlocked={isUnlocked} onPick={onPick}/>
    </Sheet>
  );
}
