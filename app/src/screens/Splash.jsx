import { useEffect } from 'react';
import { useI18n } from '../i18n/index.jsx';

export default function Splash({ next }) {
  const { t } = useI18n();
  useEffect(() => {
    const id = setTimeout(next, 1800);
    return () => clearTimeout(id);
  }, [next]);
  return (
    <div className="phone" onClick={next} style={{ alignItems: 'center' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' }}>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow), transparent 60%)', filter: 'blur(20px)' }}></div>
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div className="splash-dot"></div>
          <div style={{ fontWeight: 700, fontSize: 38, letterSpacing: '-0.045em' }}>Claudionoid</div>
        </div>
      </div>
      <div className="eyebrow" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 60px)', color: 'var(--faint)' }}>{t('Loading your humanoids…')}</div>
    </div>
  );
}
