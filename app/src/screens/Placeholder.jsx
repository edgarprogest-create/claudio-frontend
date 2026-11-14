import { useI18n } from '../i18n/index.jsx';
import { AppBar, ClaudioMark, Eyebrow, Hi, toast } from '../components/ui.jsx';

function greeting(h) {
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 19) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Temporary tab screen until Fase 3 (Home, History, Humanoids) lands.
 * Home already shows the final header + greeting.
 */
export default function Placeholder({ screen, name }) {
  const { t, locale } = useI18n();
  const now = new Date();
  const title = { home: null, history: 'History', humanoids: 'Humanoids' }[screen];
  return (
    <div className="phone">
      <AppBar left={screen === 'home' ? <ClaudioMark/> : null}
        mid={title ? <div className="mid">{t(title)}</div> : null}
        right={screen === 'home' ? <button className="side accent" data-tap onClick={() => toast('Coming soon')}>{t('+ New')}</button> : null}/>
      <div className="scroll" style={{ padding: '0 20px 20px' }}>
        {screen === 'home' && (
          <div style={{ padding: '18px 0 26px' }}>
            <Eyebrow style={{ marginBottom: 10 }}>
              {now.toLocaleDateString(locale, { weekday: 'long' })} · {now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
            </Eyebrow>
            <h1 className="display" style={{ fontSize: 38, margin: 0 }}>
              {t(greeting(now.getHours()))}{name ? <>,<br/><Hi>{name.split(' ')[0]}.</Hi></> : '.'}
            </h1>
          </div>
        )}
        <div className="card" style={{ padding: '18px 16px', marginTop: screen === 'home' ? 0 : 18 }}>
          <Eyebrow style={{ color: 'var(--accent)', marginBottom: 6 }}>{t('Under construction')}</Eyebrow>
          <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.45, marginBottom: 12 }}>{t('This screen arrives in the next update.')}</div>
          <a href="/index.html" style={{ fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>{t('Open current app →')}</a>
        </div>
      </div>
    </div>
  );
}
