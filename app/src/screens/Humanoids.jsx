import { useI18n } from '../i18n/index.jsx';
import { AppBar, Hi } from '../components/ui.jsx';
import PersonaGrid from '../components/PersonaGrid.jsx';

export default function Humanoids({ isUnlocked, newChat, openLocked, showUpsell, goPlans }) {
  const { t } = useI18n();
  return (
    <div className="phone">
      <AppBar mid={<div className="mid">{t('Humanoids')}</div>}/>
      <div className="scroll" style={{ padding: '4px 20px 20px' }}>
        <div style={{ padding: '10px 0 20px' }}>
          <h1 className="display" style={{ fontSize: 32, margin: '0 0 8px' }}>{t('Ten angles')} <Hi>{t('on you.')}</Hi></h1>
          <div style={{ fontSize: 13.5, color: 'var(--dim)', lineHeight: 1.45 }}>{t('Tap one to start a conversation. You can swap mid-chat.')}</div>
        </div>
        {showUpsell && (
          <div role="button" data-tap onClick={goPlans} className="upsell" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 22, color: 'var(--accent)' }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t('Unlock all 10 humanoids')}</div>
              <div style={{ fontSize: 12, color: 'var(--accent)' }}>{t('Advanced · 24h free')}</div>
            </div>
            <div style={{ color: 'var(--accent)', fontSize: 18 }}>›</div>
          </div>
        )}
        <PersonaGrid isUnlocked={isUnlocked} onPick={(id, open) => (open ? newChat(id) : openLocked(id))}/>
      </div>
    </div>
  );
}
