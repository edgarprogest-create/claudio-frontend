import { useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { PERSONAS } from '../data/personas.js';
import { clock, dayGroup, lastLine } from '../lib/conversations.js';
import { AppBar, Eyebrow, Hi, toast } from '../components/ui.jsx';

/** Row that reveals an 88px red "Delete" when swiped left (snaps at 44px). */
function SwipeRow({ children, onDelete, onOpen, last }) {
  const { t } = useI18n();
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const st = useRef(null);
  const down = e => { st.current = { x: e.clientX, y: e.clientY, base: dx, moved: false, horiz: null }; setDragging(true); };
  const move = e => {
    const s = st.current;
    if (!s) return;
    const d = e.clientX - s.x;
    if (s.horiz === null && (Math.abs(d) > 6 || Math.abs(e.clientY - s.y) > 6)) {
      s.horiz = Math.abs(d) > Math.abs(e.clientY - s.y);
      if (s.horiz) e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!s.horiz) { if (s.horiz === false) s.moved = true; return; }
    s.moved = true;
    setDx(Math.max(-88, Math.min(0, s.base + d)));
  };
  const up = () => {
    const s = st.current;
    st.current = null;
    setDragging(false);
    if (!s) return;
    if (!s.moved) { dx < 0 ? setDx(0) : onOpen(); return; }
    if (s.horiz) setDx(dx < -44 ? -88 : 0);
  };
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <button onClick={onDelete} tabIndex={dx < 0 ? 0 : -1}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 88, background: 'var(--error)', color: '#fff', border: 'none', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
        {t('Delete')}
      </button>
      <div role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onOpen()}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ position: 'relative', transform: `translateX(${dx}px)`, transition: dragging ? 'none' : 'transform .25s cubic-bezier(.22,1,.36,1)', background: 'var(--bg)', touchAction: 'pan-y', cursor: 'pointer', userSelect: 'none' }}>
        {children}
      </div>
    </div>
  );
}

export default function History({ conversations, openChat, deleteChat, clearAll, confirm }) {
  const { t, locale } = useI18n();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const list = conversations.filter(c => !query
    || `${c.title} ${PERSONAS[c.humanoid].name} ${lastLine(c)}`.toLowerCase().includes(query));
  const groups = [];
  for (const c of list) {
    const g = dayGroup(c.updatedAt, locale);
    const cur = groups[groups.length - 1];
    if (cur && cur.label === g) cur.items.push(c); else groups.push({ label: g, items: [c] });
  }

  return (
    <div className="phone">
      <AppBar mid={<div className="mid">{t('History')}</div>}
        right={conversations.length > 0 && (
          <button className="side" style={{ color: 'var(--error)' }} data-tap onClick={() => confirm({
            title: 'Clear all history?',
            body: `${t('This deletes')} ${conversations.length} ${t('conversations. Your humanoids keep their memory of you.')}`,
            action: 'Clear', danger: true, onConfirm: clearAll,
          })}>{t('Clear')}</button>
        )}/>
      <div className="scroll" style={{ padding: '4px 20px 20px' }}>
        <div style={{ padding: '10px 0 16px' }}>
          <h1 className="display" style={{ fontSize: 32, margin: 0 }}><Hi>{conversations.length}</Hi> {t('conversations')}</h1>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 6 }}>{t('Swipe left on a conversation to delete it.')}</div>
        </div>
        {conversations.length > 0 && (
          <div className="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('Search conversations')} aria-label={t('Search conversations')} type="search"/>
            {q && <button onClick={() => setQ('')} aria-label="Clear search" style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 15 }}>×</button>}
          </div>
        )}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--dim)', fontSize: 14 }}>
            {conversations.length ? `${t('Nothing matches')} “${q}”.` : t('No conversations yet. Tap + to start one.')}
          </div>
        )}
        {groups.map(g => (
          <div key={g.label} style={{ marginBottom: 20 }}>
            <Eyebrow style={{ marginBottom: 4 }}>{t(g.label)}</Eyebrow>
            {g.items.map((c, j) => (
              <SwipeRow key={c.id} last={j === g.items.length - 1} onOpen={() => openChat(c.id)}
                onDelete={() => { deleteChat(c.id); toast('Conversation deleted'); }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
                  <div style={{ fontSize: 16, color: 'var(--accent)', width: 22, textAlign: 'center' }}>{PERSONAS[c.humanoid].glyph}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ellipsis" style={{ fontSize: 14, fontWeight: 600 }}>{c.title || t('New conversation')}</div>
                    <div className="ellipsis" style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>{PERSONAS[c.humanoid].name} · {lastLine(c)}</div>
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--faint)', fontWeight: 500 }}>{clock(c.updatedAt, locale)}</div>
                </div>
              </SwipeRow>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
