import { useI18n } from '../i18n/index.jsx';
import { PLANS } from '../data/plans.js';
import { AppBar, Eyebrow, Hi } from '../components/ui.jsx';

export default function Plans({ back, plan, checkout, openQuiz }) {
  const { t } = useI18n();
  const current = plan === 'trial' ? 'advanced' : plan;
  return (
    <div className="phone">
      <AppBar left={<button className="side" data-tap onClick={back}>{t('← Back')}</button>} mid={<div className="mid">{t('Plans')}</div>}/>
      <div className="scroll" style={{ padding: '14px 20px 30px' }}>
        <Eyebrow style={{ marginBottom: 10 }}>{t('Three ways in')}</Eyebrow>
        <h1 className="display" style={{ fontSize: 40, margin: '0 0 8px' }}><Hi>{t('Become.')}</Hi></h1>
        <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 18, lineHeight: 1.45 }}>{t('Cancel anytime. Start with 24h free on Advanced.')}</div>
        <div role="button" tabIndex={0} data-tap className="card quiz-entry" onClick={openQuiz}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openQuiz(); } }}>
          <span className="quiz-entry-icon" aria-hidden="true">?</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.015em' }}>{t('Not sure which plan to choose?')}</span>
            <span style={{ display: 'block', fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginTop: 2 }}>{t('Take the 30-second quiz')} →</span>
          </span>
        </div>
        {PLANS.map(p => {
          const isCur = p.id === current;
          const label = isCur ? t('Your plan')
            : p.trial && plan === 'free' ? t('Start 24h free trial')
            : current !== 'free' ? `${t('Switch to')} ${p.tier}` : t('Subscribe');
          return (
            <div key={p.id} className="plan-card" style={{ background: p.featured ? 'var(--accent-soft)' : 'var(--surface)', borderColor: p.featured || isCur ? 'var(--accent)' : 'var(--border)' }}>
              {(p.featured || isCur) && <div className="plan-badge">{t(isCur ? (plan === 'trial' ? '✦ On trial' : '✓ Current') : '✦ Popular')}</div>}
              <Eyebrow>{t(p.tier)}</Eyebrow>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '6px 0' }}>
                <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.04em', color: p.featured ? 'var(--accent)' : 'var(--text)' }}>€{p.price}</span>
                <span style={{ fontSize: 13, color: 'var(--dim)' }}>{t('/month')}</span>
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.45 }}>{t(p.desc)}</div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {p.features.map(f => <div key={f} style={{ fontSize: 13, display: 'flex', gap: 8, color: 'var(--text-2)' }}><span style={{ color: 'var(--accent)' }}>→</span>{t(f)}</div>)}
              </div>
              <button data-tap disabled={isCur} onClick={() => checkout(p)} className={p.featured ? 'btn-primary' : 'btn-ghost'}
                style={{ marginTop: 16, width: '100%', opacity: isCur ? 0.45 : 1 }}>{label}</button>
            </div>
          );
        })}
        <div className="eyebrow" style={{ fontSize: 9.5, color: 'var(--faint)', textAlign: 'center', padding: '14px 0' }}>{t('Stripe secured · Cancel anytime')}</div>
      </div>
    </div>
  );
}
