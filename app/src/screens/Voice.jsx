import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { PERSONAS } from '../data/personas.js';
import { AppBar, Eyebrow, Orb } from '../components/ui.jsx';
import { chunks, getRecognition, pickVoice, speakable, unlockSpeech } from '../lib/voice.js';

/**
 * Voice mode: listen (SpeechRecognition) → send to /api/chat like a typed message → speak the reply
 * (speechSynthesis) → listen again. Everything runs in the browser.
 *
 * Props:
 *  - persona: current humanoid id
 *  - ask(turns): sends the conversation so far + these voice turns, resolves with the reply text
 *  - onClose(turns, typeInstead): ends voice mode; turns = [{ role, content }] spoken in this session
 *  - onPlans(turns): ends voice mode (saving the turns) and opens Plans — when the token limit is reached
 */
export default function Voice({ persona, ask, onClose, onPlans }) {
  const { t, locale } = useI18n();
  const [phase, setPhase] = useState('listening'); // listening | thinking | speaking | denied | error
  const [paused, setPaused] = useState(false);
  const [interim, setInterim] = useState('');      // live transcript while listening
  const [heard, setHeard] = useState('');          // last final transcript
  const [reply, setReply] = useState('');          // last reply (shown while speaking)
  const [error, setError] = useState({ text: '', kind: '' }); // kind: 'mic' (listening failed) | 'ask' (reply failed)
  const [secs, setSecs] = useState(0);

  const turns = useRef([]);        // spoken turns of this session
  const recRef = useRef(null);
  const finalRef = useRef('');
  const pausedRef = useRef(false);
  const closedRef = useRef(false);
  const deniedRef = useRef(false);
  const failedRef = useRef(false); // recognition error: onend must not restart listening
  const askRef = useRef(ask);
  askRef.current = ask;            // always the latest conversation from App
  const lastAsked = useRef('');
  const touched = useRef(false);

  const name = PERSONAS[persona]?.name || 'Claudionoid';

  // ── Listening ──
  const listen = useCallback(() => {
    if (closedRef.current || pausedRef.current) return;
    const Rec = getRecognition();
    if (!Rec) return;
    try { recRef.current?.abort(); } catch { /* ignore */ }
    finalRef.current = '';
    deniedRef.current = false;
    failedRef.current = false;
    setInterim(''); setHeard(''); setError({ text: '', kind: '' });
    setPhase('listening');

    const rec = new Rec();
    rec.lang = locale;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = e => {
      let fin = '', part = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) fin += r[0].transcript; else part += r[0].transcript;
      }
      finalRef.current = fin;
      setInterim((fin + part).trim());
    };
    rec.onerror = e => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { deniedRef.current = true; setPhase('denied'); return; }
      if (e.error === 'aborted' || e.error === 'no-speech') return; // onend decides what's next
      failedRef.current = true;
      setError({ text: e.error === 'network' ? 'Connection error. Try again.' : 'The microphone stopped working. Try again.', kind: 'mic' });
      setPhase('error');
    };
    rec.onend = () => {
      if (recRef.current !== rec) return; // a newer session replaced this one
      recRef.current = null;
      if (closedRef.current || pausedRef.current || deniedRef.current || failedRef.current) return;
      const text = finalRef.current.trim();
      if (text) send(text);
      else setTimeout(listen, 250); // silence: keep listening
    };
    recRef.current = rec;
    try { rec.start(); } catch { /* already started */ }
  }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Speaking ──
  const speak = useCallback(text => {
    const synth = window.speechSynthesis;
    const parts = chunks(speakable(text));
    if (!parts.length) { listen(); return; }
    setPhase('speaking');
    try {
      synth.cancel();
      const voice = pickVoice(locale);
      parts.forEach((p, i) => {
        const u = new SpeechSynthesisUtterance(p);
        u.lang = locale;
        if (voice) { try { u.voice = voice; } catch { /* keep the browser's default voice for this language */ } }
        if (i === parts.length - 1) {
          u.onend = () => { if (!closedRef.current && !pausedRef.current) listen(); };
          u.onerror = ev => { if (ev.error !== 'interrupted' && ev.error !== 'canceled' && !closedRef.current && !pausedRef.current) listen(); };
        }
        synth.speak(u);
      });
    } catch {
      // Speech output failed: the reply stays on screen; carry on listening.
      setTimeout(listen, 1500);
    }
  }, [locale, listen]);

  // ── One voice turn ──
  async function send(text) {
    setHeard(text); setInterim('');
    setPhase('thinking');
    lastAsked.current = text;
    turns.current.push({ role: 'user', content: text });
    let answer;
    try {
      answer = await askRef.current(turns.current);
    } catch (e) {
      turns.current.pop(); // keep the history valid: no unanswered user turn
      if (closedRef.current) return;
      const limit = e.status === 429 || e.status === 402;
      setError(limit ? { text: 'Limit reached. Upgrade your plan.', kind: 'limit' } : { text: e.message || 'Something went wrong. Try again.', kind: 'ask' });
      setPhase('error');
      return;
    }
    turns.current.push({ role: 'assistant', content: answer });
    setReply(answer);
    if (closedRef.current || pausedRef.current) return; // paused: keep the reply on screen; resuming listens again
    speak(answer);
  }

  // ── Pause / resume / end ──
  function stopAll() {
    try { recRef.current?.abort(); } catch { /* ignore */ }
    recRef.current = null;
    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
  }
  function togglePause() {
    unlockSpeech();
    if (pausedRef.current) {
      pausedRef.current = false; setPaused(false);
      if (phase !== 'thinking') listen();
    } else {
      pausedRef.current = true; setPaused(true);
      stopAll();
    }
  }
  function onOrb() {
    // First tap on the orb unlocks speech on iPhone Safari.
    if (!touched.current) { touched.current = true; unlockSpeech(); }
    togglePause();
  }
  function end(typeInstead = false) {
    closedRef.current = true;
    stopAll();
    onClose(turns.current, typeInstead);
  }
  function retry() {
    if (error.kind === 'ask' && lastAsked.current) send(lastAsked.current); // resend what the user said
    else listen();
  }

  useEffect(() => { listen(); return () => { closedRef.current = true; stopAll(); }; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (paused || phase === 'denied' || phase === 'error') return undefined;
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [paused, phase]);

  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const blocked = phase === 'denied' || phase === 'error';
  const label = phase === 'denied' ? t('Microphone') : phase === 'error' ? t('Voice') : paused ? t('Paused')
    : { listening: t('Listening'), thinking: t('Thinking'), speaking: `${name} ${t('is speaking')}` }[phase];
  const orbState = paused || blocked ? 'idle' : phase;

  let body;
  if (phase === 'denied') {
    body = <>
      <div className="display" style={{ fontSize: 22, lineHeight: 1.3, marginBottom: 10 }}>{t('We need the microphone to talk with you.')}</div>
      <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.45, marginBottom: 16 }}>{t('Allow microphone access in your browser settings if no prompt appears.')}</div>
      <button data-tap className="btn-primary" onClick={listen}>{t('Try again')}</button>
    </>;
  } else if (phase === 'error') {
    body = <>
      <div style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.45, marginBottom: 16 }} role="alert">{t(error.text)}</div>
      {error.kind === 'limit'
        ? <button data-tap className="btn-primary" onClick={() => { closedRef.current = true; stopAll(); onPlans(turns.current); }}>{t('See plans →')}</button>
        : <button data-tap className="btn-primary" onClick={retry}>{t('Try again')}</button>}
    </>;
  } else if (phase === 'speaking' || (paused && reply && !interim)) {
    body = <div className="voice-text speaking">{speakable(reply)}</div>;
  } else if (phase === 'thinking') {
    body = <div className="voice-text" style={{ color: 'var(--dim)' }}>“{heard}”</div>;
  } else {
    body = <div className="voice-text">{interim ? <>“{interim}<span className="caret"></span>”</> : <span style={{ color: 'var(--faint)' }}>{t('Say something…')}<span className="caret"></span></span>}</div>;
  }

  return (
    <div className="phone voice-screen">
      <AppBar left={<button className="side" data-tap onClick={() => end(false)}>{t('← Chat')}</button>}
        mid={<div className="mid">✦ {t('Voice')} · {name}</div>}/>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '20px 26px calc(env(safe-area-inset-bottom) + 34px)' }}>
        <div style={{ marginTop: 24 }}><Orb size={200} state={orbState} onClick={blocked ? undefined : onOrb}/></div>
        <div style={{ textAlign: 'center', width: '100%', minHeight: 150, maxWidth: 560 }} aria-live="polite">
          <Eyebrow style={{ marginBottom: 14, color: phase === 'speaking' && !paused ? 'var(--accent)' : undefined }}>{label}</Eyebrow>
          {body}
          {!blocked && <div className="eyebrow" style={{ color: 'var(--faint)', marginTop: 18 }}>◉ {mmss} · {t('Tap orb to')} {t(paused ? 'resume' : 'pause')}</div>}
        </div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <button data-tap className="round-btn" onClick={() => end(true)} aria-label={t('Type instead')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/></svg>
          </button>
          <button data-tap className="round-btn big" onClick={togglePause} disabled={blocked} aria-label={t(paused ? 'Resume' : 'Pause')} style={{ opacity: blocked ? 0.4 : 1 }}>
            {paused ? <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z"/></svg>
              : <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>}
          </button>
          <button data-tap className="round-btn" onClick={() => end(false)} aria-label={t('End')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
