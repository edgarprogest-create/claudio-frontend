function greeting() {
  const h = new Date().getHours();
  return t(h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 19 ? 'Good afternoon' : 'Good evening');
}

function PersonaTag({ id, style }) {
  return <div className="eyebrow" style={{ color: 'var(--accent)', ...style }}>✦ {PERSONAS[id].name}</div>;
}

function lastText(c) {
  const m = c.messages[c.messages.length - 1];
  return m ? m.content.split('\n').find(Boolean) : '';
}

// ───────── HOME ─────────
function ScreenHome({ conversations, openChat, newChat, isUnlocked, openLocked, tab }) {
  return (
    <div className="phone">
      <AppBar left={<ClaudioMark/>} right={<button className="side accent" data-tap onClick={() => newChat()}>{t('+ New')}</button>}/>
      <div className="scroll" style={{ padding: '0 20px 20px' }}>
        <div style={{ padding: '18px 0 26px' }}>
          <Eyebrow style={{ marginBottom: 10 }}>{new Date().toLocaleDateString(locale(), { weekday: 'long' })} · {new Date().toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit' })}</Eyebrow>
          <div className="display" style={{ fontSize: 38 }}>{greeting()},<br/><span className="italic">Pedro.</span></div>
        </div>
        {conversations.length > 0 && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Eyebrow>{t("Continue")}</Eyebrow>
            <button className="eyebrow link-btn" data-tap onClick={() => tab('history')}>{t('See all →')}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {conversations.slice(0, 3).map(c => (
              <div key={c.id} className="card" data-tap onClick={() => openChat(c.id)} style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <PersonaTag id={c.persona} style={{ fontSize: 9.5 }}/>
                  <div style={{ fontSize: 10.5, color: 'var(--faint)', fontWeight: 500 }}>{c.time}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, letterSpacing: '-0.015em' }}>{c.title}</div>
                <div className="ellipsis" style={{ fontSize: 13, color: 'var(--dim)' }}>{lastText(c)}</div>
              </div>
            ))}
          </div>
        </>}
        <Eyebrow style={{ marginBottom: 12 }}>{t("Quick start")}</Eyebrow>
        <div className="hscroll">
          {Object.keys(PERSONAS).filter(id => id !== 'default').map(id => {
            const p = PERSONAS[id], open = isUnlocked(id);
            return (
              <div key={id} data-tap className="chip" onClick={() => open ? newChat(id) : openLocked(id)} style={{ opacity: open ? 1 : 0.6, '--p': p.color }}>
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

// ───────── CHAT ─────────
function Bubble({ m }) {
  const isUser = m.role === 'user';
  return (
    <div className={`bubble ${isUser ? 'me' : 'ai'}`}>
      {m.attachment && <div className="attach-chip" style={{ marginBottom: m.content ? 8 : 0 }}>◫ {m.attachment}</div>}
      {m.content}
    </div>
  );
}

function ScreenChat({ chat, typing, onSend, back, openHumanoid, openMenu, openVoice, openAttach, attachment, clearAttachment }) {
  const scrollRef = useRef(null);
  const [text, setText] = useState('');
  const p = PERSONAS[chat.persona];
  useEffect(() => { const s = scrollRef.current; if (s) s.scrollTop = s.scrollHeight; }, [chat.messages.length, typing]);
  const send = (t = text) => {
    if ((!t.trim() && !attachment) || typing) return;
    onSend(t.trim()); setText('');
  };
  const canSend = (text.trim() || attachment) && !typing;
  return (
    <div className="phone chat-screen" style={{ '--p': p.color }}>
      <AppBar left={<button className="side" data-tap onClick={back}>{t('← Back')}</button>}
        mid={<button data-tap onClick={openHumanoid} className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="live-dot"></span>{p.name} <span style={{ fontSize: 9 }}>▾</span></button>}
        right={<button className="side" data-tap onClick={openMenu} style={{ fontSize: 18, letterSpacing: 0 }}>⋯</button>}/>
      <div ref={scrollRef} className="scroll" style={{ padding: '8px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {chat.messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px 0 8px' }}>
            <div style={{ fontSize: 34, color: 'var(--accent)', marginBottom: 14 }}>{p.glyph}</div>
            <div className="display" style={{ fontSize: 38, marginBottom: 8 }}>{t("What's on your")} <span className="italic">{t('mind?')}</span></div>
            <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 24 }}>{p.name} · {t(p.desc)}</div>
            <Eyebrow style={{ marginBottom: 12 }}>{t("Try one of these")}</Eyebrow>
            {(SUGGESTIONS[chat.persona] || SUGGESTIONS.default).map(s => (
              <div key={s} data-tap onClick={() => send(t(s))} className="card" style={{ padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 14, flex: 1, color: 'var(--text-2)' }}>{t(s)}</div>
                <div style={{ color: 'var(--faint)' }}>↗</div>
              </div>
            ))}
          </div>
        ) : <>
          <Eyebrow style={{ alignSelf: 'center', padding: '6px 0', color: 'var(--faint)' }}>{t("Today")}</Eyebrow>
          {chat.messages.map((m, i) => m.role === 'system'
            ? <div key={i} className="eyebrow" style={{ alignSelf: 'center', color: 'var(--faint)', fontSize: 9.5, padding: '4px 0' }}>{m.content}</div>
            : <Bubble key={i} m={m}/>)}
          {typing && <div className="bubble ai" style={{ display: 'flex', gap: 4, padding: '14px 16px' }}>{[0, 1, 2].map(i => <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.15}s` }}></span>)}</div>}
        </>}
      </div>
      <div className="composer-wrap">
        {attachment && (
          <div style={{ display: 'flex', padding: '0 6px 8px' }}>
            <div className="attach-chip">◫ {attachment}<button onClick={clearAttachment} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0 0 0 6px', fontSize: 13 }}>×</button></div>
          </div>
        )}
        <div className="composer">
          <button data-tap className="icon-btn" onClick={openAttach} aria-label="Attach">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
            placeholder={`${t('Message')} ${p.name}…`} className="composer-input"/>
          <button data-tap onClick={openVoice} className="icon-btn" aria-label="Voice">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
          </button>
          <button data-tap onClick={() => send()} disabled={!canSend} className="send-btn" aria-label="Send" style={{ opacity: canSend ? 1 : 0.45, cursor: canSend ? 'pointer' : 'default' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────── VOICE ─────────
const VOICE_LINES = ['so the question is whether I should tell him or just let it go', 'I guess I\'m scared it changes things between us', 'okay. what would you do?'];

function ScreenVoice({ persona, close }) {
  const [phase, setPhase] = useState('listening');
  const [paused, setPaused] = useState(false);
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const [secs, setSecs] = useState(0);
  const log = useRef([]);
  const line = t(VOICE_LINES[idx % VOICE_LINES.length]);
  const reply = t(REPLIES[persona]);

  useEffect(() => { if (paused) return; const t = setInterval(() => setSecs(s => s + 1), 1000); return () => clearInterval(t); }, [paused]);
  useEffect(() => {
    if (paused) return;
    if (phase === 'listening') {
      if (chars < line.length) { const t = setTimeout(() => setChars(c => c + 1), 45); return () => clearTimeout(t); }
      const t = setTimeout(() => { log.current.push({ role: 'user', content: line }); setPhase('thinking'); }, 700); return () => clearTimeout(t);
    }
    if (phase === 'thinking') { const t = setTimeout(() => setPhase('speaking'), 1100); return () => clearTimeout(t); }
    if (phase === 'speaking') {
      const t = setTimeout(() => { log.current.push({ role: 'assistant', content: reply }); setIdx(i => i + 1); setChars(0); setPhase('listening'); }, 3600); return () => clearTimeout(t);
    }
  }, [phase, chars, paused]);

  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const label = paused ? t('Paused') : { listening: t('Listening'), thinking: t('Thinking'), speaking: PERSONAS[persona].name + ' ' + t('is speaking') }[phase];
  return (
    <div className="phone">
      <AppBar left={<button className="side" data-tap onClick={() => close(log.current)}>{t('← Chat')}</button>} mid={<div className="mid">✦ {t('Voice')} · {PERSONAS[persona].name}</div>}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '30px 26px 44px' }}>
        <div style={{ marginTop: 40 }}><Orb size={200} state={paused ? 'idle' : phase} onClick={() => setPaused(!paused)}/></div>
        <div style={{ textAlign: 'center', width: '100%', minHeight: 150 }}>
          <Eyebrow style={{ marginBottom: 14, color: phase === 'speaking' && !paused ? 'var(--accent)' : undefined }}>{t(label)}</Eyebrow>
          <div className="display" style={{ fontSize: phase === 'speaking' ? 20 : 24, lineHeight: 1.25, fontWeight: phase === 'speaking' ? 500 : 700, letterSpacing: '-0.02em' }}>
            {phase === 'speaking' ? reply : phase === 'thinking' ? <span style={{ color: 'var(--dim)' }}>“{line}”</span> : <>“{line.slice(0, chars)}<span className="caret"></span>”</>}
          </div>
          <div className="eyebrow" style={{ color: 'var(--faint)', marginTop: 18 }}>◉ {mmss} · {t('Tap orb to')} {t(paused ? 'resume' : 'pause')}</div>
        </div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <button data-tap className="round-btn" onClick={() => close(log.current, true)} aria-label="Type instead">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>
          </button>
          <button data-tap className="round-btn big" onClick={() => setPaused(!paused)} aria-label="Pause">
            {paused ? <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z"/></svg>
              : <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>}
          </button>
          <button data-tap className="round-btn" onClick={() => close(log.current)} aria-label="End">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────── HISTORY ─────────
function SwipeRow({ children, onDelete, onOpen, last }) {
  const [dx, setDx] = useState(0);
  const st = useRef(null);
  const down = e => { st.current = { x: e.clientX, base: dx, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = e => { if (!st.current) return; const d = e.clientX - st.current.x; if (Math.abs(d) > 5) st.current.moved = true; setDx(Math.max(-88, Math.min(0, st.current.base + d))); };
  const up = () => { if (!st.current) return; const moved = st.current.moved; st.current = null; if (!moved) { dx < 0 ? setDx(0) : onOpen(); return; } setDx(dx < -44 ? -88 : 0); };
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <button onClick={onDelete} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 88, background: 'var(--error)', color: '#fff', border: 'none', fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{t('Delete')}</button>
      <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ transform: `translateX(${dx}px)`, transition: st.current ? 'none' : 'transform .25s cubic-bezier(.22,1,.36,1)', background: 'var(--bg)', touchAction: 'pan-y', cursor: 'pointer', userSelect: 'none' }}>
        {children}
      </div>
    </div>
  );
}

function ScreenHistory({ conversations, openChat, deleteChat, clearAll, confirm }) {
  const [q, setQ] = useState('');
  const list = conversations.filter(c => (c.title + ' ' + PERSONAS[c.persona].name + ' ' + lastText(c)).toLowerCase().includes(q.toLowerCase()));
  const groups = [...new Set(list.map(c => c.group))];
  return (
    <div className="phone">
      <AppBar mid={<div className="mid">{t('History')}</div>}
        right={conversations.length > 0 && <button className="side" style={{ color: 'var(--error)' }} data-tap
          onClick={() => confirm({ title: 'Clear all history?', body: `${t('This deletes')} ${conversations.length} ${t('conversations. Your humanoids keep their memory of you.')}`, action: 'Clear', danger: true, onConfirm: clearAll })}>{t('Clear')}</button>}/>
      <div className="scroll" style={{ padding: '4px 20px 20px' }}>
        <div style={{ padding: '10px 0 16px' }}>
          <div className="display" style={{ fontSize: 32 }}><span className="italic">{conversations.length}</span> {t('conversations')}</div>
          <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 6 }}>{t('Swipe left on a conversation to delete it.')}</div>
        </div>
        {conversations.length > 0 && (
          <div className="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('Search conversations')}/>
            {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 15 }}>×</button>}
          </div>
        )}
        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--dim)', fontSize: 14 }}>
            {conversations.length ? `${t('Nothing matches')} “${q}”.` : t('No conversations yet. Tap + to start one.')}
          </div>
        )}
        {groups.map(g => {
          const items = list.filter(c => c.group === g);
          return (
            <div key={g} style={{ marginBottom: 20 }}>
              <Eyebrow style={{ marginBottom: 4 }}>{t(g)}</Eyebrow>
              {items.map((c, j) => (
                <SwipeRow key={c.id} last={j === items.length - 1} onOpen={() => openChat(c.id)} onDelete={() => { deleteChat(c.id); toast('Conversation deleted'); }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
                    <div style={{ fontSize: 16, color: 'var(--accent)', width: 22, textAlign: 'center' }}>{PERSONAS[c.persona].glyph}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ellipsis" style={{ fontSize: 14, fontWeight: 600 }}>{c.title}</div>
                      <div className="ellipsis" style={{ fontSize: 12, color: 'var(--dim)', marginTop: 2 }}>{PERSONAS[c.persona].name} · {lastText(c)}</div>
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--faint)', fontWeight: 500 }}>{c.time}</div>
                  </div>
                </SwipeRow>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { ScreenHome, ScreenChat, ScreenVoice, ScreenHistory, PersonaTag });
