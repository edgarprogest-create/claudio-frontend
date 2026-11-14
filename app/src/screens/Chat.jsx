import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { PERSONAS, SUGGESTIONS } from '../data/personas.js';
import { dayGroup, messageAttachments, messageText } from '../lib/conversations.js';
import { AppBar, Eyebrow, Hi } from '../components/ui.jsx';
import Markdown from '../components/Markdown.jsx';

function Bubble({ m }) {
  const isUser = m.role === 'user';
  const text = messageText(m);
  const files = messageAttachments(m);
  return (
    <div className={`bubble ${isUser ? 'me' : 'ai'}`}>
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: text ? 8 : 0 }}>
          {files.map((f, i) => <div key={i} className="attach-chip">{f.type === 'image' || f.type?.startsWith?.('image') ? '◫' : '▤'} {f.name}</div>)}
        </div>
      )}
      {isUser ? text : <Markdown text={text}/>}
    </div>
  );
}

const Typing = () => (
  <div className="bubble ai" style={{ display: 'flex', gap: 4, padding: '14px 16px' }} aria-label="…">
    {[0, 1, 2].map(i => <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.15}s` }}></span>)}
  </div>
);

export default function Chat({ persona, conv, pending, error, onSend, back, openHumanoid, openMenu, openAttach, openVoice, attachments, removeAttachment, goPlans }) {
  const { t, locale } = useI18n();
  const p = PERSONAS[persona];
  const messages = conv?.messages || [];
  const notes = conv?.notes || [];
  const busy = !!pending;
  const [text, setText] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const pendingText = pending?.text;
  useEffect(() => {
    const s = scrollRef.current;
    if (s) s.scrollTop = s.scrollHeight;
  }, [messages.length, notes.length, busy, pendingText, error]);

  // Auto-grow the textarea up to ~5 lines.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [text]);

  const canSend = (text.trim() || attachments.length > 0) && !busy;
  const send = (value = text) => {
    if ((!value.trim() && !attachments.length) || busy) return;
    onSend(value.trim());
    setText('');
  };

  const noteFor = i => notes.filter(n => n.at === i);
  const note = (n, k) => (
    <div key={k} className="eyebrow" style={{ alignSelf: 'center', color: 'var(--faint)', fontSize: 9.5, padding: '4px 0' }}>
      {t('Switched to')} {PERSONAS[n.persona]?.name}
    </div>
  );

  return (
    <div className="phone chat-screen" style={{ '--p': p.color }}>
      <AppBar left={<button className="side" data-tap onClick={back}>{t('← Back')}</button>}
        mid={(
          <button data-tap onClick={openHumanoid} className="eyebrow" aria-label={t('Change humanoid')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span className="live-dot"></span>{p.name} <span style={{ fontSize: 9 }}>▾</span>
          </button>
        )}
        right={<button className="side" data-tap onClick={openMenu} aria-label="Menu" style={{ fontSize: 18, letterSpacing: 0 }}>⋯</button>}/>

      <div ref={scrollRef} className="scroll" style={{ padding: '8px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && !busy ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px 0 8px' }}>
            <div style={{ fontSize: 34, color: 'var(--accent)', marginBottom: 14 }}>{p.glyph}</div>
            <h1 className="display" style={{ fontSize: 38, margin: '0 0 8px' }}>{t("What's on your")} <Hi>{t('mind?')}</Hi></h1>
            <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 24 }}>{p.name} · {t(p.desc)}</div>
            <Eyebrow style={{ marginBottom: 12 }}>{t('Try one of these')}</Eyebrow>
            {(SUGGESTIONS[persona] || SUGGESTIONS.default).map(s => (
              <div key={s} role="button" data-tap onClick={() => send(t(s))} className="card" style={{ padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 14, flex: 1, color: 'var(--text-2)' }}>{t(s)}</div>
                <div style={{ color: 'var(--faint)' }}>↗</div>
              </div>
            ))}
          </div>
        ) : <>
          <Eyebrow style={{ alignSelf: 'center', padding: '6px 0', color: 'var(--faint)' }}>{t(dayGroup(conv?.updatedAt || Date.now(), locale))}</Eyebrow>
          {messages.map((m, i) => (
            <Fragment key={i}>
              {noteFor(i).map((n, j) => note(n, `n${i}-${j}`))}
              <Bubble m={m}/>
            </Fragment>
          ))}
          {noteFor(messages.length).map((n, j) => note(n, `n-end-${j}`))}
          {busy && (pendingText ? <div className="bubble ai"><Markdown text={pendingText}/></div> : <Typing/>)}
          {error && (
            <div role="alert" style={{ alignSelf: 'center', textAlign: 'center', color: 'var(--error)', fontSize: 13, lineHeight: 1.4, padding: '4px 12px' }}>
              {t(error.message)}
              <br/>
              {error.upgrade
                ? <button className="link-btn" data-tap onClick={goPlans} style={{ fontWeight: 600, fontSize: 13, fontFamily: 'inherit', marginTop: 6 }}>{t('See plans →')}</button>
                : <button className="link-btn" data-tap onClick={() => onSend(error.retry || '')} style={{ fontWeight: 600, fontSize: 13, fontFamily: 'inherit', marginTop: 6 }}>{t('Try again')}</button>}
            </div>
          )}
        </>}
      </div>

      <div className="composer-wrap">
        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 6px 8px' }}>
            {attachments.map((a, i) => (
              <div key={i} className="attach-chip">
                {a.type.startsWith('image/') ? '◫' : '▤'} <span className="ellipsis" style={{ maxWidth: 140 }}>{a.name}</span>
                <button onClick={() => removeAttachment(i)} aria-label={`${t('Delete')} ${a.name}`}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0 0 0 6px', fontSize: 13 }}>×</button>
              </div>
            ))}
          </div>
        )}
        <div className="composer">
          <button data-tap className="icon-btn" onClick={openAttach} aria-label={t('Add to message')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <textarea ref={inputRef} rows={1} value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
            placeholder={`${t('Message')} ${p.name}…`} aria-label={`${t('Message')} ${p.name}`} className="composer-input"
            style={{ resize: 'none', lineHeight: 1.4, maxHeight: 120 }}/>
          <button data-tap onClick={openVoice} className="icon-btn" aria-label={t('Voice')}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
          </button>
          <button data-tap onClick={() => send()} disabled={!canSend} className="send-btn" aria-label="Send"
            style={{ opacity: canSend ? 1 : 0.45, cursor: canSend ? 'pointer' : 'default' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
