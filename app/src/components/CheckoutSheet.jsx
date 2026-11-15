import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { startCheckout } from '../lib/api.js';
import { loadStripe } from '../lib/stripe.js';
import { PLANS } from '../data/plans.js';
import { Eyebrow, Hi, PrimaryBtn, Sheet } from './ui.jsx';

/**
 * Summary + Stripe Embedded Checkout, inside the app (no external page).
 * When the payment finishes, Stripe sends the browser to /?checkout=done&session_id=…,
 * where App shows <CheckoutDone/>.
 */
export default function CheckoutSheet({ p, plan, onClose, onSessionExpired }) {
  const { t } = useI18n();
  const [st, setSt] = useState('loading'); // loading | ready | error
  const [err, setErr] = useState('');
  const [trial, setTrial] = useState(!!p.trial && plan === 'free'); // the backend has the final say
  const [attempt, setAttempt] = useState(0);
  const mountRef = useRef(null);

  useEffect(() => {
    let checkout;
    let cancelled = false;
    setSt('loading');
    setErr('');
    (async () => {
      try {
        const [stripe, data] = await Promise.all([loadStripe(), startCheckout({ plan: p.id })]);
        if (cancelled) return;
        setTrial(!!data.trial);
        checkout = await stripe.initEmbeddedCheckout({ fetchClientSecret: () => Promise.resolve(data.clientSecret) });
        if (cancelled) { checkout.destroy(); return; }
        checkout.mount(mountRef.current);
        setSt('ready');
      } catch (e) {
        if (cancelled) return;
        if (e.status === 401) { onSessionExpired(); return; }
        setErr(e.message === 'Stripe unavailable' ? 'Could not load the payment form. Check your connection.' : e.message);
        setSt('error');
      }
    })();
    // Stripe allows only one Embedded Checkout at a time: always tear it down.
    return () => { cancelled = true; checkout?.destroy(); };
  }, [p.id, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = trial
    ? [[t('Today'), '€0.00'], [t('After 24h'), `€${p.price}.00 ${t('/ month')}`], [t('Cancel'), t('Anytime, one tap')]]
    : [[t('Monthly'), `€${p.price}.00`], [t('Billed'), t('Today, then monthly')], [t('Cancel'), t('Anytime, one tap')]];

  return (
    <Sheet onClose={onClose} tall>
      <Eyebrow style={{ marginBottom: 6 }}>{t('Checkout')}</Eyebrow>
      <div className="display" style={{ fontSize: 28, marginBottom: 18 }}>{p.tier}</div>
      <div className="card" style={{ padding: '4px 16px', marginBottom: 16 }}>
        {rows.map(([a, b], i) => (
          <div key={a} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13.5 }}>
            <span style={{ color: 'var(--dim)' }}>{a}</span><span style={{ fontWeight: 600 }}>{b}</span>
          </div>
        ))}
      </div>

      <div className="embedded-checkout">
        <div ref={mountRef}></div>
        {st === 'loading' && <div className="embedded-checkout-msg">{t('Loading secure payment…')}</div>}
        {st === 'error' && (
          <div className="embedded-checkout-msg">
            <div className="auth-err" role="alert" style={{ marginBottom: 12 }}>{t(err)}</div>
            <button data-tap className="btn-ghost" onClick={() => setAttempt(n => n + 1)}>{t('Try again')}</button>
          </div>
        )}
      </div>

      <button data-tap onClick={onClose} className="btn-ghost" style={{ width: '100%', marginTop: 12 }}>{t('Not now')}</button>
      <div className="eyebrow" style={{ fontSize: 9, color: 'var(--faint)', textAlign: 'center', paddingTop: 12 }}>{t('Stripe secured · Cancel anytime')}</div>
    </Sheet>
  );
}

/** Shown after Stripe sends the user back with ?checkout=done. */
export function CheckoutDone({ result, onDone }) {
  const { t } = useI18n();
  const tier = PLANS.find(x => x.id === result.plan)?.tier;
  const body = result.trial
    ? t('Advanced is free for the next 24 hours. All 11 humanoids are unlocked.')
    : tier ? `${t("You're now on")} ${tier}.` : t('Payment received. Thank you!');
  return (
    <Sheet onClose={onDone}>
      <div style={{ textAlign: 'center', padding: '16px 0 6px' }}>
        <div className="success-ring">✓</div>
        <div className="display" style={{ fontSize: 30, margin: '18px 0 8px' }}>{t("You're")} <Hi>{t('in_checkout')}</Hi></div>
        <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 22, lineHeight: 1.45 }}>{body}</div>
        <PrimaryBtn full onClick={onDone} style={{ borderRadius: 14, padding: 14 }}>{t('Start talking →')}</PrimaryBtn>
      </div>
    </Sheet>
  );
}
