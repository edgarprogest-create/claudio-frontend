import { useI18n } from '../i18n/index.jsx';

const ICONS = {
  home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
  history: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  humanoids: <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
};

/** Tab bar: Home · History · [+] · Humanoids · Settings. The + sits in a 72px gap, raised above the bar. */
export default function TabBar({ active, onChange, onNew }) {
  const { t } = useI18n();
  const tab = (id, label) => (
    <button key={id} className={`tab ${active === id ? 'active' : ''}`} onClick={() => onChange(id)} data-tap
      aria-label={t(label)} aria-current={active === id ? 'page' : undefined}>
      <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{ICONS[id]}</svg><span className="tab-label">{t(label)}</span>
    </button>
  );
  return (
    <nav className="tabs">
      {tab('home', 'Home')}{tab('history', 'History')}
      <div className="tab-gap"></div>
      <button className="tab-new" data-tap onClick={onNew} aria-label="New chat">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      {tab('humanoids', 'Humanoids')}{tab('settings', 'Settings')}
    </nav>
  );
}
