import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { PERSONAS } from '../data/personas.js';
import { lastLine, shortWhen } from '../lib/conversations.js';
import { AppBar, ClaudioMark, Eyebrow, Hi } from '../components/ui.jsx';

function greeting(h) {
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 19) return 'Good afternoon';
  return 'Good evening';
}

export function PersonaTag({ id, style }) {
  return <div className="eyebrow" style={{ color: 'var(--accent)', ...style }}>✦ {PERSONAS[id].name}</div>;
}

/** Re-render every minute so the clock + greeting stay current. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function Home({ name, conversations, openChat, newChat, isUnlocked, openLocked, tab }) {
  const { t, locale } = useI18n();
  const now = useNow();
  const first = (name || '').trim().split(' ')[0];
  return (
    <div className="phone">
      <AppBar left={<ClaudioMark/>} right={<button className="side accent" data-tap onClick={() => newChat()}>{t('+ New')}</button>}/>
      <div className="scroll" style={{ padding: '0 20px 20px' }}>
        <div style={{ padding: '18px 0 26px' }}>
          <Eyebrow style={{ marginBottom: 10 }}>
            {now.toLocaleDateString(locale, { weekday: 'long' })} · {now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
          </Eyebrow>
          <h1 className="display" style={{ fontSize: 38, margin: 0 }}>
            {t(greeting(now.getHours()))}{first ? <>,<br/><Hi>{first}.</Hi></> : '.'}
          </h1>
        </div>

        {conversations.length > 0 && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Eyebrow>{t('Continue')}</Eyebrow>
            <button className="eyebrow link-btn" data-tap onClick={() => tab('history')}>{t('See all →')}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {conversations.slice(0, 3).map(c => (
              <div key={c.id} className="card" role="button" data-tap onClick={() => openChat(c.id)} style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <PersonaTag id={c.humanoid} style={{ fontSize: 9.5 }}/>
                  <div style={{ fontSize: 10.5, color: 'var(--faint)', fontWeight: 500 }}>{shortWhen(c.updatedAt, locale)}</div>
                </div>
                <div className="ellipsis" style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, letterSpacing: '-0.015em' }}>{c.title || t('New conversation')}</div>
                <div className="ellipsis" style={{ fontSize: 13, color: 'var(--dim)' }}>{lastLine(c)}</div>
              </div>
            ))}
          </div>
        </>}

        <Eyebrow style={{ marginBottom: 12 }}>{t('Quick start')}</Eyebrow>
        <div className="hscroll">
          {Object.keys(PERSONAS).filter(id => id !== 'default').map(id => {
            const p = PERSONAS[id], open = isUnlocked(id);
            return (
              <div key={id} role="button" data-tap className="chip" onClick={() => (open ? newChat(id) : openLocked(id))} style={{ opacity: open ? 1 : 0.6, '--p': p.color }}>
                <span style={{ fontSize: 15, color: 'var(--accent)' }}>{p.glyph}</span>{p.name}
                {!open && <span className="pro-tag">Pro</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
