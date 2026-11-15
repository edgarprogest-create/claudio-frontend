import { useCallback, useEffect, useRef, useState } from 'react';
import { useI18n, LANGS } from './i18n/index.jsx';
import { STYLES, DEFAULT_STYLE } from './data/styles.js';
import { PERSONAS } from './data/personas.js';
import { BACKEND_MODE, systemPrompt } from './data/prompts.js';
import { K, store, saveSession, clearSession, hasSession } from './lib/storage.js';
import { streamChat, getCheckoutStatus, cancelTrial as apiCancelTrial, deleteAccount as apiDeleteAccount } from './lib/api.js';
import { loadConversations, saveConversations, makeTitle } from './lib/conversations.js';
import { MAX_FILES, MAX_FILE_SIZE, readAttachment, toContentBlocks } from './lib/files.js';
import usePlan from './hooks/usePlan.js';
import { Confirm, ListSheet, toast } from './components/ui.jsx';
import { HumanoidSheet, LockedSheet, RenameSheet } from './components/sheets.jsx';
import TabBar from './components/TabBar.jsx';
import StyleSheet from './components/StyleSheet.jsx';
import CheckoutSheet, { CheckoutDone } from './components/CheckoutSheet.jsx';
import QuizSheet from './components/QuizSheet.jsx';
import InstallSheet from './components/InstallSheet.jsx';
import Splash from './screens/Splash.jsx';
import Language from './screens/Language.jsx';
import Onboarding, { OB_LAST } from './screens/Onboarding.jsx';
import Auth from './screens/Auth.jsx';
import Home from './screens/Home.jsx';
import Chat from './screens/Chat.jsx';
import History from './screens/History.jsx';
import Humanoids from './screens/Humanoids.jsx';
import Settings from './screens/Settings.jsx';
import Plans from './screens/Plans.jsx';

const TABS = ['home', 'history', 'humanoids', 'settings'];
const DEFAULT_PERSONA_KEY = 'claudio_default_persona';

function initialStyle() {
  const s = store.get(K.style);
  return STYLES[s] ? s : DEFAULT_STYLE;
}

const newId = () => 'c_' + Date.now();

export default function App() {
  const { t, lang, setLang } = useI18n();
  const [style, setStyleState] = useState(initialStyle);
  const [chatWallpaper, setChatWallpaperState] = useState(() => store.get(K.chatWallpaper) !== '0');
  const [nav, setNav] = useState({ screen: 'splash', anim: 'fade' });
  const [obStep, setObStep] = useState(0);
  const [loggedIn, setLoggedIn] = useState(hasSession);
  const [user, setUser] = useState(() => ({ name: store.get(K.name) || '', email: store.get(K.email) || '' }));
  const [sheet, setSheet] = useState(null);
  const [dialog, setDialog] = useState(null);

  const [convs, setConvs] = useState(loadConversations);
  const [chat, setChat] = useState({ id: newId(), persona: 'default' });
  const [pending, setPending] = useState(null);   // { convId, text } while a reply streams
  const [chatError, setChatError] = useState(null); // { convId, message, upgrade, retry }
  const [attachments, setAttachments] = useState([]);
  const [defaultPersona, setDefaultPersonaState] = useState(() => (PERSONAS[store.get(DEFAULT_PERSONA_KEY)] ? store.get(DEFAULT_PERSONA_KEY) : 'default'));

  const plan = usePlan(loggedIn);
  const { isUnlocked } = plan;
  const screen = nav.screen;
  const lastTab = useRef('home');
  const plansFrom = useRef('settings');
  const fileInputs = { camera: useRef(null), library: useRef(null), file: useRef(null) };

  const go = useCallback((s, anim = 'push') => setNav({ screen: s, anim }), []);
  useEffect(() => { if (TABS.includes(screen)) lastTab.current = screen; }, [screen]);
  useEffect(() => { saveConversations(convs); }, [convs]);

  // Style → <html> class + theme-color meta.
  useEffect(() => {
    const de = document.documentElement;
    de.classList.remove('theme-ember', 'theme-brisa', 'theme-noir', 'theme-papel', 'theme-cor', 'theme-vidro');
    de.classList.add('theme-' + style);
    store.set(K.style, style);
    const bg = getComputedStyle(de).getPropertyValue('--bg').trim();
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', bg || STYLES[style].bg);
  }, [style]);

  // Back from Stripe Embedded Checkout: /?checkout=done&session_id=cs_…
  const checkoutReturn = useRef(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    if (params.get('checkout') !== 'done' || !sessionId) return;
    history.replaceState(null, '', location.pathname); // don't re-run on reload
    checkoutReturn.current = getCheckoutStatus(sessionId).catch(e => ({ failed: true, status401: e.status === 401 }));
  }, []);
  useEffect(() => {
    if (!checkoutReturn.current || screen === 'splash' || screen === 'lang') return;
    const pending = checkoutReturn.current;
    checkoutReturn.current = null;
    pending.then(r => {
      if (r.status401) sessionExpired();
      else if (r.failed) toast('Could not confirm the payment. Check your plan in Settings.');
      else if (r.status === 'complete') { plan.refresh(); setTimeout(plan.refresh, 5000); setSheet({ type: 'checkout-done', result: r }); }
      else toast('Payment not completed.');
    });
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chat wallpaper on/off → <html> class (CSS in app.css).
  useEffect(() => { document.documentElement.classList.toggle('no-chat-wallpaper', !chatWallpaper); }, [chatWallpaper]);
  function setChatWallpaper(on) {
    setChatWallpaperState(on);
    store.set(K.chatWallpaper, on ? '1' : '0');
  }

  const afterLanguage = useCallback(() => {
    if (hasSession()) go('home', 'fade');
    else if (store.get(K.onboardingDone)) go('auth', 'fade');
    else go('ob', 'fade');
  }, [go]);
  // First run: pick a language right after the Splash.
  const afterSplash = useCallback(() => {
    if (store.get(K.langChosen)) afterLanguage();
    else go('lang', 'fade');
  }, [go, afterLanguage]);

  // ── Session ──
  function onSignedIn(session) {
    saveSession(session);
    setLoggedIn(true);
    setUser({ name: session.name || store.get(K.name) || '', email: session.email || '' });
    const first = (session.name || '').split(' ')[0];
    toast(first ? `${t('Welcome,')} ${first}` : t('Welcome,').replace(/,$/, ''));
    go('home', 'up');
  }
  function signOut() {
    clearSession();
    setLoggedIn(false);
    setUser({ name: '', email: '' });
    go('auth', 'fade');
  }
  function sessionExpired() {
    setSheet(null);
    clearSession();
    setLoggedIn(false);
    toast('Session expired. Sign in again.');
    go('auth', 'fade');
  }
  async function deleteAccount() {
    try {
      const deleted = await apiDeleteAccount();
      if (!deleted) {
        // Backend endpoint not live yet → the delete-account page explains the email route.
        window.open('/delete-account.html', '_blank', 'noopener');
        return;
      }
      setConvs([]);
      localStorage.removeItem(DEFAULT_PERSONA_KEY);
      signOut();
      toast('Account deleted');
    } catch (e) {
      if (e.status === 401) sessionExpired(); else toast(e.message);
    }
  }
  async function cancelTrial() {
    try {
      await apiCancelTrial();
      toast('Trial canceled');
      plan.refresh();
    } catch (e) {
      if (e.status === 401) sessionExpired(); else toast(e.message);
    }
  }
  function setDefaultPersona(id) {
    setDefaultPersonaState(id);
    store.set(DEFAULT_PERSONA_KEY, id);
    toast(`${t('Default:')} ${PERSONAS[id].name}`);
  }
  function setStyle(v) {
    setStyleState(v);
    toast(`${t('Style:')} ${t(STYLES[v].name)}`);
  }

  const goPlans = () => {
    plansFrom.current = TABS.includes(screen) || screen === 'chat' ? screen : 'settings';
    setSheet(null);
    go('plans');
  };
  const openLocked = id => setSheet({ type: 'locked', id });

  // ── Conversations ──
  const conv = convs.find(c => c.id === chat.id);
  const updateConv = (id, fn) => setConvs(cs => cs.map(c => (c.id === id ? fn(c) : c)));

  function newChat(persona = defaultPersona) {
    const p = isUnlocked(persona) ? persona : 'default';
    setChat({ id: newId(), persona: p });
    setAttachments([]);
    setChatError(null);
    go('chat');
  }
  function openChat(id) {
    const c = convs.find(x => x.id === id);
    if (!c) return;
    setChat({ id: c.id, persona: plan.loaded && !isUnlocked(c.humanoid) ? 'default' : c.humanoid });
    setAttachments([]);
    setChatError(null);
    go('chat');
  }
  function deleteChat(id) {
    setConvs(cs => cs.filter(c => c.id !== id));
  }
  function setPersona(id) {
    if (!isUnlocked(id)) { openLocked(id); return; }
    setSheet(null);
    if (id === chat.persona) return;
    setChat(c => ({ ...c, persona: id }));
    if (conv?.messages.length) {
      updateConv(conv.id, c => ({ ...c, humanoid: id, notes: [...(c.notes || []), { at: c.messages.length, persona: id }] }));
    }
  }

  async function send(text) {
    if (pending) return;
    if (!hasSession()) { toast('Session expired. Sign in again.'); go('auth', 'fade'); return; }
    const id = chat.id;
    const persona = isUnlocked(chat.persona) ? chat.persona : 'default';
    const atts = attachments;
    const userMsg = { role: 'user', content: toContentBlocks(text, atts) };
    if (atts.length) userMsg.attachments = atts.map(a => ({ name: a.name, type: a.type }));
    const prev = convs.find(c => c.id === id);
    const messages = [...(prev?.messages || []), userMsg];
    const now = Date.now();
    const next = prev
      ? { ...prev, messages, updatedAt: now, humanoid: persona }
      : { id, title: makeTitle(text || atts[0]?.name), messages, updatedAt: now, humanoid: persona, notes: [] };
    setConvs(cs => [next, ...cs.filter(c => c.id !== id)]);
    setAttachments([]);
    setChatError(null);
    setPending({ convId: id, text: '' });

    try {
      const reply = await streamChat({
        messages: messages.map(({ role, content }) => ({ role, content })),
        humanoid: BACKEND_MODE[persona] || persona,
        system: systemPrompt(persona, lang),
        lang,
        onText: s => setPending(p => (p && p.convId === id ? { ...p, text: s } : p)),
      });
      updateConv(id, c => ({ ...c, messages: [...c.messages, { role: 'assistant', content: reply }], updatedAt: Date.now() }));
      plan.refresh();
    } catch (e) {
      // Like the old app: drop the failed user turn so the history stays valid, and offer a retry.
      setConvs(cs => cs
        .map(c => (c.id === id ? { ...c, messages: c.messages.filter(m => m !== userMsg) } : c))
        .filter(c => c.id !== id || c.messages.length));
      setAttachments(a => (a.length ? a : atts));
      if (e.status === 401) {
        sessionExpired();
      } else {
        setChatError({ convId: id, message: e.message, upgrade: e.status === 402 || e.status === 429, retry: text });
      }
    } finally {
      setPending(null);
    }
  }

  // ── Attachments ──
  async function onFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    for (const f of files) {
      if (attachments.length >= MAX_FILES) { toast(`${t('Maximum')} ${MAX_FILES} ${t('files')}`); break; }
      if (f.size > MAX_FILE_SIZE) { toast('File too large (max 10 MB)'); continue; }
      try {
        const a = await readAttachment(f);
        setAttachments(list => (list.length >= MAX_FILES ? list : [...list, a]));
      } catch {
        toast('Could not read the file');
      }
    }
  }
  const pick = k => fileInputs[k].current?.click();

  // ── Screens ──
  let body;
  if (screen === 'splash') body = <Splash next={afterSplash}/>;
  else if (screen === 'lang') body = <Language onPick={() => { store.set(K.langChosen, '1'); afterLanguage(); }}/>;
  else if (screen === 'ob') body = <Onboarding step={obStep} setStep={setObStep} done={() => { store.set(K.onboardingDone, '1'); go('auth'); }}/>;
  else if (screen === 'auth') body = <Auth back={() => { setObStep(OB_LAST); go('ob', 'pop'); }} onSignedIn={onSignedIn}/>;
  else if (screen === 'home') body = <Home name={user.name} conversations={convs} openChat={openChat} newChat={newChat} isUnlocked={isUnlocked} openLocked={openLocked} tab={s => go(s, 'fade')} openInstall={() => setSheet({ type: 'install' })}/>;
  else if (screen === 'history') body = <History conversations={convs} openChat={openChat} deleteChat={deleteChat} confirm={setDialog} clearAll={() => { setConvs([]); toast('History cleared'); }}/>;
  else if (screen === 'humanoids') body = <Humanoids isUnlocked={isUnlocked} newChat={newChat} openLocked={openLocked} showUpsell={plan.loaded && !plan.fullAccess} goPlans={goPlans}/>;
  else if (screen === 'settings') body = (
    <Settings name={user.name} email={user.email} style={style} plan={plan} defaultPersona={defaultPersona}
      chatWallpaper={chatWallpaper} setChatWallpaper={setChatWallpaper}
      openSheet={type => setSheet({ type })} goPlans={goPlans} confirm={setDialog} signOut={signOut}
      deleteAccount={deleteAccount} cancelTrial={cancelTrial}
      invoices={() => toast(plan.uiPlan === 'free' ? 'No invoices yet' : 'Stripe emails you every invoice.')}/>
  );
  else if (screen === 'plans') body = <Plans back={() => go(plansFrom.current, 'pop')} plan={plan.uiPlan} checkout={p => setSheet({ type: 'checkout', p })} openQuiz={() => setSheet({ type: 'quiz' })}/>;
  else if (screen === 'chat') body = (
    <Chat persona={chat.persona} conv={conv}
      pending={pending?.convId === chat.id ? pending : null}
      error={chatError?.convId === chat.id ? chatError : null}
      onSend={send} back={() => go(lastTab.current, 'pop')}
      openHumanoid={() => setSheet({ type: 'humanoid' })} openMenu={() => setSheet({ type: 'menu' })}
      openAttach={() => setSheet({ type: 'attach' })} openVoice={() => toast('Coming soon')}
      attachments={attachments} removeAttachment={i => setAttachments(a => a.filter((_, j) => j !== i))}
      goPlans={goPlans}/>
  );

  let sheetEl = null;
  if (sheet) {
    const close = () => setSheet(null);
    const later = s => setTimeout(() => setSheet(s), 50);
    switch (sheet.type) {
      case 'style': sheetEl = <StyleSheet value={style} onPick={setStyle} onClose={close}/>; break;
      case 'lang': sheetEl = <ListSheet title="Language" onClose={close} items={LANGS.map(l => ({ label: l.label, check: l.id === lang, onClick: () => setLang(l.id) }))}/>; break;
      case 'persona': sheetEl = (
        <ListSheet title="Default humanoid for new chats" onClose={close}
          items={Object.keys(PERSONAS).filter(isUnlocked).map(id => ({ icon: PERSONAS[id].glyph, label: PERSONAS[id].name, check: id === defaultPersona, onClick: () => setDefaultPersona(id) }))}/>
      ); break;
      case 'checkout': sheetEl = <CheckoutSheet p={sheet.p} plan={plan.uiPlan} onClose={close} onSessionExpired={sessionExpired}/>; break;
      case 'quiz': sheetEl = <QuizSheet plan={plan.uiPlan} onClose={close} onCheckout={p => setSheet({ type: 'checkout', p })}/>; break;
      case 'checkout-done': sheetEl = <CheckoutDone result={sheet.result} onDone={() => { close(); go('humanoids', 'fade'); }}/>; break;
      case 'install': sheetEl = <InstallSheet onClose={close}/>; break;
      case 'locked': sheetEl = <LockedSheet id={sheet.id} onClose={close} goPlans={goPlans}/>; break;
      case 'humanoid': sheetEl = <HumanoidSheet current={chat.persona} isUnlocked={isUnlocked} onPick={setPersona} onClose={close}/>; break;
      case 'rename': sheetEl = <RenameSheet value={conv?.title || ''} onClose={close} onSave={v => { updateConv(chat.id, c => ({ ...c, title: v })); toast('Renamed'); }}/>; break;
      case 'attach': sheetEl = (
        <ListSheet title="Add to message" onClose={close} items={[
          { icon: '◎', label: 'Camera', onClick: () => pick('camera') },
          { icon: '◫', label: 'Photo library', onClick: () => pick('library') },
          { icon: '▤', label: 'File', onClick: () => pick('file') },
        ]}/>
      ); break;
      case 'menu': sheetEl = (
        <ListSheet onClose={close} items={[
          { icon: '✦', label: 'Change humanoid', onClick: () => later({ type: 'humanoid' }) },
          { icon: '◉', label: 'Switch to voice', onClick: () => toast('Coming soon') },
          ...(conv ? [
            { icon: '✎', label: 'Rename', onClick: () => later({ type: 'rename' }) },
            { icon: '⌫', label: 'Delete conversation', danger: true, onClick: () => setDialog({
              title: 'Delete this conversation?', body: 'This cannot be undone.', action: 'Delete', danger: true,
              onConfirm: () => { deleteChat(chat.id); setChat({ id: newId(), persona: defaultPersona }); go(lastTab.current, 'pop'); toast('Conversation deleted'); },
            }) },
          ] : []),
        ]}/>
      ); break;
      default: break;
    }
  }

  const showTabs = TABS.includes(screen);
  return (
    <div className="app-root">
      <div className="app-shell">
        <div key={screen} className={`scr anim-${nav.anim}${showTabs ? ' with-tabs' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>{body}</div>
          {showTabs && <TabBar active={screen} onChange={s => go(s, 'fade')} onNew={() => newChat()}/>}
        </div>
        {sheetEl}
        {dialog && <Confirm {...dialog} onClose={() => setDialog(null)}/>}
      </div>
      <input ref={fileInputs.camera} type="file" accept="image/*" capture="environment" hidden onChange={onFiles}/>
      <input ref={fileInputs.library} type="file" accept="image/*" multiple hidden onChange={onFiles}/>
      <input ref={fileInputs.file} type="file" accept="image/*,application/pdf,text/*,.doc,.docx,.csv,.md" multiple hidden onChange={onFiles}/>
    </div>
  );
}
