import { useCallback, useEffect, useState } from 'react';
import { useI18n, LANGS } from './i18n/index.jsx';
import { STYLES, DEFAULT_STYLE } from './data/styles.js';
import { K, store, saveSession, clearSession, hasSession } from './lib/storage.js';
import { Confirm, ListSheet, toast } from './components/ui.jsx';
import TabBar from './components/TabBar.jsx';
import StyleSheet from './components/StyleSheet.jsx';
import Splash from './screens/Splash.jsx';
import Onboarding, { OB_LAST } from './screens/Onboarding.jsx';
import Auth from './screens/Auth.jsx';
import Placeholder from './screens/Placeholder.jsx';
import Settings from './screens/Settings.jsx';

const TABS = ['home', 'history', 'humanoids', 'settings'];

function initialStyle() {
  const s = store.get(K.style);
  return STYLES[s] ? s : DEFAULT_STYLE;
}

export default function App() {
  const { t, lang, setLang } = useI18n();
  const [style, setStyleState] = useState(initialStyle);
  const [nav, setNav] = useState({ screen: 'splash', anim: 'fade' });
  const [obStep, setObStep] = useState(0);
  const [user, setUser] = useState(() => ({ name: store.get(K.name) || '', email: store.get(K.email) || '' }));
  const [sheet, setSheet] = useState(null);
  const [dialog, setDialog] = useState(null);
  const screen = nav.screen;

  const go = useCallback((s, anim = 'push') => setNav({ screen: s, anim }), []);

  // Style → <html> class + theme-color meta.
  useEffect(() => {
    const de = document.documentElement;
    de.classList.remove('theme-noir', 'theme-papel', 'theme-cor');
    de.classList.add('theme-' + style);
    store.set(K.style, style);
    const bg = getComputedStyle(de).getPropertyValue('--bg').trim();
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', bg || STYLES[style].bg);
  }, [style]);

  const afterSplash = useCallback(() => {
    // Logged in → straight to Home; otherwise onboarding (or auth if seen before).
    if (hasSession()) go('home', 'fade');
    else if (store.get(K.onboardingDone)) go('auth', 'fade');
    else go('ob', 'fade');
  }, [go]);

  function onSignedIn(session) {
    saveSession(session);
    setUser({ name: session.name || store.get(K.name) || '', email: session.email || '' });
    const first = (session.name || '').split(' ')[0];
    toast(first ? `${t('Welcome,')} ${first}` : t('Welcome,').replace(/,$/, ''));
    go('home', 'up');
  }

  function signOut() {
    clearSession();
    setUser({ name: '', email: '' });
    go('auth', 'fade');
  }

  function setStyle(v) {
    setStyleState(v);
    toast(`${t('Style:')} ${t(STYLES[v].name)}`);
  }

  let body;
  if (screen === 'splash') body = <Splash next={afterSplash}/>;
  else if (screen === 'ob') body = <Onboarding step={obStep} setStep={setObStep} done={() => { store.set(K.onboardingDone, '1'); go('auth'); }}/>;
  else if (screen === 'auth') body = <Auth back={() => { setObStep(OB_LAST); go('ob', 'pop'); }} onSignedIn={onSignedIn}/>;
  else if (screen === 'settings') body = <Settings name={user.name} email={user.email} style={style} openSheet={type => setSheet({ type })} confirm={setDialog} signOut={signOut}/>;
  else body = <Placeholder screen={screen} name={user.name}/>;

  let sheetEl = null;
  if (sheet) {
    const close = () => setSheet(null);
    if (sheet.type === 'style') sheetEl = <StyleSheet value={style} onPick={setStyle} onClose={close}/>;
    else if (sheet.type === 'lang') sheetEl = (
      <ListSheet title="Language" onClose={close}
        items={LANGS.map(l => ({ label: l.label, check: l.id === lang, onClick: () => setLang(l.id) }))}/>
    );
  }

  const showTabs = TABS.includes(screen);
  return (
    <div className="app-root">
      <div className="app-shell">
        <div key={screen} className={`scr anim-${nav.anim}${showTabs ? ' with-tabs' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>{body}</div>
          {showTabs && <TabBar active={screen} onChange={s => go(s, 'fade')} onNew={() => toast('Coming soon')}/>}
        </div>
        {sheetEl}
        {dialog && <Confirm {...dialog} onClose={() => setDialog(null)}/>}
      </div>
    </div>
  );
}
