import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { createSubscription } from '../lib/api.js';
import { loadStripe } from '../lib/stripe.js';
import { Eyebrow, Hi, PrimaryBtn, Sheet } from './ui.jsx';

const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Review → card (Stripe Card Element) → pay → success. Keeps the repo's Stripe flow. */
export default function CheckoutSheet({ p, plan, onClose, onPaid, onDone, onSessionExpired }) {
  const { t, lang } = useI18n();
  const trial = !!p.trial && plan === 'free';
  const [st, setSt] = useState('loading'); // loading | ready | paying | done | unavailable
  const [err, setErr] = useState('');
  const [doneTrial, setDoneTrial] = useState(trial);
  const cardRef = useRef(null);
  const stripeRef = useRef(null);
  const cardElRef = useRef(null);

  useEffect(() => {
    let card;
    let cancelled = false;
    loadStripe().then(stripe => {
      if (cancelled || !cardRef.current) return;
      stripeRef.current = stripe;
      const elements = stripe.elements({
        locale: lang,
        fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap' }],
      });
      card = elements.create('card', {
        hidePostalCode: true,
        style: {
          base: { color: cssVar('--text'), fontFamily: 'Montserrat, system-ui, sans-serif', fontSize: '16px', fontWeight: '500', '::placeholder': { color: cssVar('--faint') } },
          invalid: { color: cssVar('--error') },
        },
      });
      card.mount(cardRef.current);
      card.on('change', e => setErr(e.error ? e.error.message : ''));
      cardElRef.current = card;
      setSt('ready');
    }).catch(() => !cancelled && setSt('unavailable'));
    return () => { cancelled = true; card?.destroy(); };
  }, [lang]);

  async function pay() {
    if (st !== 'ready') return;
    setErr('');
    setSt('paying');
    try {
      const data = await createSubscription(p.id);
      if (data.url) { window.location.href = data.url; return; }
      const stripe = stripeRef.current;
      const payment_method = { card: cardElRef.current };
      let result;
      if (data.clientSecret) result = await stripe.confirmCardPayment(data.clientSecret, { payment_method });
      else if (data.setupIntentClientSecret) result = await stripe.confirmCardSetup(data.setupIntentClientSecret, { payment_method });
      else throw new Error(t('Something went wrong. Try again.'));
      if (result.error) { setErr(result.error.message); setSt('ready'); return; }
      setDoneTrial(!!data.setupIntentClientSecret);
      setSt('done');
      onPaid();
    } catch (e) {
      if (e.status === 401) { onSessionExpired(); return; }
      setErr(t(e.message));
      setSt('ready');
    }
  }

  if (st === 'done') {
    return (
      <Sheet onClose={onDone}>
        <div style={{ textAlign: 'center', padding: '16px 0 6px' }}>
          <div className="success-ring">✓</div>
          <div className="display" style={{ fontSize: 30, margin: '18px 0 8px' }}>{t("You're")} <Hi>{t('in_checkout')}</Hi></div>
          <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 22, lineHeight: 1.45 }}>
            {doneTrial ? t('Advanced is free for the next 24 hours. All 10 humanoids are unlocked.') : `${t("You're now on")} ${p.tier}.`}
          </div>
          <PrimaryBtn full onClick={onDone} style={{ borderRadius: 14, padding: 14 }}>{t('Start talking →')}</PrimaryBtn>
        </div>
      </Sheet>
    );
  }

  const rows = trial
    ? [[t('Today'), '€0.00'], [t('After 24h'), `€${p.price}.00 ${t('/ month')}`], [t('Cancel'), t('Anytime, one tap')]]
    : [[t('Monthly'), `€${p.price}.00`], [t('Billed'), t('Today, then monthly')], [t('Cancel'), t('Anytime, one tap')]];

  return (
    <Sheet onClose={st === 'paying' ? () => {} : onClose}>
      <Eyebrow style={{ marginBottom: 6 }}>{t('Checkout')}</Eyebrow>
      <div className="display" style={{ fontSize: 28, marginBottom: 18 }}>{p.tier}</div>
      <div className="card" style={{ padding: '4px 16px', marginBottom: 16 }}>
        {rows.map(([a, b], i) => (
          <div key={a} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13.5 }}>
            <span style={{ color: 'var(--dim)' }}>{a}</span><span style={{ fontWeight: 600 }}>{b}</span>
          </div>
        ))}
      </div>
      <Eyebrow style={{ marginBottom: 8 }}>{t('Card')}</Eyebrow>
      <div className="field stripe-card" style={{ marginBottom: 8, minHeight: 50 }}>
        <div ref={cardRef}></div>
        {st === 'loading' && <span style={{ color: 'var(--faint)', fontSize: 14 }}>…</span>}
        {st === 'unavailable' && <span style={{ color: 'var(--error)', fontSize: 13 }}>{t('Could not load the payment form. Check your connection.')}</span>}
      </div>
      <div className="auth-err" role="alert">{err}</div>
      <button data-tap onClick={pay} disabled={st !== 'ready'} className="btn-auth"
        style={{ background: 'var(--text)', color: 'var(--bg)', border: 'none', width: '100%', marginBottom: 10, opacity: st === 'ready' || st === 'paying' ? 1 : 0.5 }}>
        {st === 'paying' ? t('Confirming…') : trial ? t('Start 24h free trial') : `${t('Pay')} €${p.price}.00`}
      </button>
      <button data-tap onClick={onClose} disabled={st === 'paying'} className="btn-ghost" style={{ width: '100%' }}>{t('Not now')}</button>
      <div className="eyebrow" style={{ fontSize: 9, color: 'var(--faint)', textAlign: 'center', paddingTop: 12 }}>{t('Stripe secured · Cancel anytime')}</div>
    </Sheet>
  );
}
