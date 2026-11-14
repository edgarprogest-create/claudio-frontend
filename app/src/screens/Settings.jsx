import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { STYLES } from '../data/styles.js';
import { PERSONAS } from '../data/personas.js';
import { PLAN_NAMES } from '../data/plans.js';
import { AppBar, Eyebrow, SGroup, SRow } from '../components/ui.jsx';

/** Live HH:MM:SS until `endsAt`. */
function useCountdown(endsAt) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!endsAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  if (!endsAt) return '';
  const left = Math.max(0, Math.floor((new Date(endsAt).getTime() - now) / 1000));
  const p = n => String(n).padStart(2, '0');
  return `${p(Math.floor(left / 3600))}:${p(Math.floor(left / 60) % 60)}:${p(left % 60)}`;
}

const fmtTokens = n => (n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : `${Math.round(n / 1000)}K`);

export default function Settings({ name, email, style, plan, defaultPersona, openSheet, goPlans, confirm, signOut, deleteAccount, cancelTrial, invoices }) {
  const { t, langLabel } = useI18n();
  const { uiPlan, usage, trialEndsAt } = plan;
  const countdown = useCountdown(uiPlan === 'trial' ? trialEndsAt : null);
  const unlimited = uiPlan === 'everyday' || (usage && !usage.limit && usage.used > 0);
  const pct = usage?.limit ? Math.min(100, (usage.used / usage.limit) * 100) : 0;

  return (
    <div className="phone">
      <AppBar mid={<div className="mid">{t('Settings')}</div>}/>
      <div className="scroll" style={{ padding: '8px 18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div className="avatar">{(name || email || '?').trim().charAt(0).toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <div className="ellipsis" style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.025em' }}>{name || '—'}</div>
            <div className="ellipsis" style={{ fontSize: 12.5, color: 'var(--dim)' }}>{email}</div>
          </div>
        </div>

        <div role="button" data-tap onClick={goPlans} className="upsell" style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 22, color: 'var(--accent)' }}>✦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>
              {uiPlan === 'free' ? t('Try Advanced free for 24h') : uiPlan === 'trial' ? t('Trial active · Advanced') : `${t('Plan')}: ${t(PLAN_NAMES[uiPlan])}`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
              {uiPlan === 'free' ? t('All 10 humanoids · Opus') : uiPlan === 'trial' ? `${countdown} ${t('remaining')}` : t('Manage or change plan')}
            </div>
          </div>
          <div style={{ color: 'var(--accent)', fontSize: 18 }}>›</div>
        </div>

        {usage && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <Eyebrow>{t('Tokens this week')}</Eyebrow>
              <div style={{ fontSize: 12, fontWeight: 600 }}>
                {unlimited ? t('Unlimited') : <><span style={{ color: 'var(--accent)' }}>{fmtTokens(usage.used)}</span> {t('of')} {fmtTokens(usage.limit)}</>}
              </div>
            </div>
            <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
              <div style={{ width: (unlimited ? 0 : pct) + '%', height: '100%', background: 'var(--accent)', borderRadius: 2, transition: 'width .5s' }}></div>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 6 }}>{t('Resets Monday')}</div>
          </div>
        )}

        <SGroup label={t('Preferences')}>
          <SRow label={t('Style')} value={t(STYLES[style].name)} onClick={() => openSheet('style')}/>
          <SRow label={t('Default humanoid')} value={PERSONAS[defaultPersona].name} onClick={() => openSheet('persona')}/>
          <SRow label={t('Language')} value={langLabel} onClick={() => openSheet('lang')} last/>
        </SGroup>
        <SGroup label={t('Plan')}>
          <SRow label={t('Current plan')} value={t(PLAN_NAMES[uiPlan])} onClick={goPlans}/>
          <SRow label={t('Invoices')} onClick={invoices} last={uiPlan !== 'trial'}/>
          {uiPlan === 'trial' && (
            <SRow label={t('Cancel trial')} last onClick={() => confirm({
              title: 'Cancel trial?', body: 'You will not be charged. Advanced humanoids lock again right away.', action: 'Cancel trial', danger: true, onConfirm: cancelTrial,
            })}/>
          )}
        </SGroup>
        <SGroup label={t('Account')}>
          <SRow label={t('Sign out')} onClick={() => confirm({
            title: 'Sign out?', body: 'Your conversations stay on this device.', action: 'Sign out', onConfirm: signOut,
          })}/>
          <SRow label={t('Delete account')} danger last onClick={() => confirm({
            title: 'Delete account?', body: 'This permanently erases your account, history and humanoid memory. It cannot be undone.', action: 'Delete', danger: true, onConfirm: deleteAccount,
          })}/>
        </SGroup>
        <div className="eyebrow" style={{ fontSize: 9, color: 'var(--faint)', textAlign: 'center', padding: '8px 0' }}>Claudionoid · {__APP_VERSION__}</div>
      </div>
    </div>
  );
}
