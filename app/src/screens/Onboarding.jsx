import { useRef } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { AppBar, Eyebrow, Hi, Orb, PrimaryBtn } from '../components/ui.jsx';

export const OB_LAST = 3;

const CARDS = [
  ['✺', 'Brother', 10, 0, null, -6], ['◉', 'Coach', 56, null, 14, 4], ['✚', 'Health', 130, 24, null, -3],
  ['☉', 'Spirit', 170, null, 0, 6], ['◈', 'Stylist', 244, 40, null, -8], ['⟁', 'Nomad', 282, null, 24, 5],
];

function ObArt({ kind, t }) {
  if (kind === 'orb') return <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 40px' }}><Orb size={180} state="idle"/></div>;
  if (kind === 'cards') {
    return (
      <div style={{ position: 'relative', height: 350, marginBottom: 8 }} aria-hidden="true">
        {CARDS.map(([g, n, top, left, right, rot], i) => (
          <div key={n} className="ob-card" style={{ top, left: left ?? undefined, right: right ?? undefined, transform: `rotate(${rot}deg)`, animationDelay: `${i * 60}ms` }}>
            <div style={{ fontSize: 24, color: 'var(--accent)', lineHeight: 1, marginBottom: 6 }}>{g}</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{n}</div>
            <div className="eyebrow" style={{ fontSize: 8.5, color: 'var(--faint)', marginTop: 4 }}>{t('Humanoid')}</div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

const PROMISES = [
  { glyph: '◇', label: 'Your data', text: 'Never sold. Never trained on. Delete anytime.' },
  { glyph: '✦', label: '24h free', text: 'Try Advanced for a full day. No card upfront.' },
  { glyph: '⟁', label: 'Cancel', text: 'One tap. No phone calls, no retention dance.' },
];

export default function Onboarding({ step, setStep, done }) {
  const { t } = useI18n();
  const steps = [
    { eyebrow: '01 · The thesis', title: <>{t('Not one AI.')}<br/><Hi>{t('Eleven of you.')}</Hi></>,
      body: t('Most AI apps give you a single, polished assistant. Claudio gives you eleven humanoids — each a different angle on you. Brother, Coach, Stylist, Healer.') },
    { eyebrow: '02 · Your roster', title: <>{t('Pick the voice you need')} <Hi>{t('today.')}</Hi></>,
      body: t('Swap mid-conversation. Each humanoid remembers you differently.'), art: 'cards' },
    { eyebrow: '03 · No typing', title: <>{t('Just')} <Hi>{t('talk.')}</Hi></>,
      body: t('Walk. Drive. Lie in bed. Tap the orb and Claudio listens — same humanoid, same memory. Voice in. Voice out.'), art: 'orb' },
    { eyebrow: '04 · The deal', title: <>{t('No tricks.')}<br/><Hi>{t('No catches.')}</Hi></>, art: 'deal' },
  ];
  const s = steps[step];
  const last = step === steps.length - 1;

  // Swipe left/right to navigate between steps.
  const touch = useRef(null);
  const onTouchStart = e => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = e => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = Math.abs(e.changedTouches[0].clientY - touch.current.y);
    touch.current = null;
    if (Math.abs(dx) < 50 || dy > 60) return;
    if (dx < 0) last ? done() : setStep(step + 1);
    else if (step > 0) setStep(step - 1);
  };

  return (
    <div className="phone" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <AppBar
        left={step > 0 ? <button className="side" data-tap onClick={() => setStep(step - 1)}>{t('← Back')}</button> : null}
        right={!last ? <button className="side" data-tap onClick={done}>{t('Skip')}</button> : null}/>
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column', padding: '12px 28px 20px' }}>
        <div key={step} className="ob-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: s.art ? 'flex-start' : 'center' }}>
          <ObArt kind={s.art} t={t}/>
          <Eyebrow style={{ marginBottom: 14 }}>{t(s.eyebrow)}</Eyebrow>
          <h1 className="display" style={{ fontSize: step === 1 ? 32 : 40, margin: '0 0 16px' }}>{s.title}</h1>
          {s.body && <div style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.5 }}>{s.body}</div>}
          {s.art === 'deal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 14 }}>
              {PROMISES.map(p => (
                <div key={p.label} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ fontSize: 24, color: 'var(--accent)', lineHeight: 1, width: 32 }}>{p.glyph}</div>
                  <div>
                    <Eyebrow style={{ color: 'var(--accent)', marginBottom: 3 }}>{t(p.label)}</Eyebrow>
                    <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.4 }}>{t(p.text)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {steps.map((_, i) => (
              <button key={i} onClick={() => setStep(i)} aria-label={`${i + 1} / ${steps.length}`}
                style={{ width: i === step ? 22 : 6, height: 6, borderRadius: 100, border: 'none', padding: 0, cursor: 'pointer', background: i === step ? 'var(--accent)' : 'var(--border-hi)', transition: 'width .3s' }}></button>
            ))}
          </div>
          <PrimaryBtn onClick={() => (last ? done() : setStep(step + 1))}>{t(last ? 'Get started →' : 'Continue →')}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
