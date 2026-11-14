import { useI18n } from '../i18n/index.jsx';
import { STYLES } from '../data/styles.js';
import { AppBar, SGroup, SRow } from '../components/ui.jsx';

/** Settings (Fase 2 subset): profile, Style, Language, Sign out. Plan/usage come in Fase 4. */
export default function Settings({ name, email, style, openSheet, confirm, signOut }) {
  const { t, langLabel } = useI18n();
  return (
    <div className="phone">
      <AppBar mid={<div className="mid">{t('Settings')}</div>}/>
      <div className="scroll" style={{ padding: '8px 18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div className="avatar">{(name || email || '?').trim().charAt(0).toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <div className="ellipsis" style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.025em' }}>{name || '—'}</div>
            <div className="ellipsis" style={{ fontSize: 12.5, color: 'var(--dim)' }}>{email}</div>
          </div>
        </div>
        <SGroup label={t('Preferences')}>
          <SRow label={t('Style')} value={t(STYLES[style].name)} onClick={() => openSheet('style')}/>
          <SRow label={t('Language')} value={langLabel} onClick={() => openSheet('lang')} last/>
        </SGroup>
        <SGroup label={t('Account')}>
          <SRow label={t('Sign out')} last onClick={() => confirm({
            title: 'Sign out?', body: 'Your conversations stay synced to your account.', action: 'Sign out', onConfirm: signOut,
          })}/>
        </SGroup>
        <div className="eyebrow" style={{ fontSize: 9, color: 'var(--faint)', textAlign: 'center', padding: '8px 0' }}>Claudionoid · {__APP_VERSION__}</div>
      </div>
    </div>
  );
}
