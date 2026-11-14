import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { AppBar, Eyebrow, Hi, PrimaryBtn, toast } from '../components/ui.jsx';
import { login, register } from '../lib/api.js';

const SUPPORT_EMAIL = 'support@claudionoid.com';
// Apple / Google sign-in need backend support (README → New backend work #2). Flip to true once it exists.
const SOCIAL_LOGIN = false;

export default function Auth({ back, onSignedIn }) {
  const { t } = useI18n();
  const [mode, setMode] = useState('in'); // 'in' = login, 'up' = register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const isUp = mode === 'up';

  const switchMode = () => { setMode(isUp ? 'in' : 'up'); setErr(''); };

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setErr('');
    const em = email.trim();
    if (isUp) {
      if (!name.trim()) return setErr(t('Please enter your name'));
      if (!em) return setErr(t('Please enter your email'));
      if (pw.length < 8) return setErr(t('Password must be at least 8 characters'));
      if (!terms) return setErr(t('Please accept the terms'));
    } else if (!em || !pw) {
      return setErr(t('Please fill in email and password'));
    }
    setLoading(true);
    try {
      const session = isUp
        ? await register({ name: name.trim(), email: em, password: pw })
        : await login({ email: em, password: pw });
      onSignedIn(session);
    } catch (ex) {
      setErr(t(ex.message));
      setLoading(false);
    }
  }

  // Apple / Google need new backend work (see README → "New backend work needed").
  const social = () => toast('Coming soon');

  const btnLabel = loading
    ? t(isUp ? 'Creating account…' : 'Signing in…')
    : t(isUp ? 'Create account →' : 'Sign in →');

  return (
    <div className="phone">
      <AppBar left={<button className="side" data-tap onClick={back}>{t('← Back')}</button>}
        right={<button className="side" data-tap onClick={() => { location.href = `mailto:${SUPPORT_EMAIL}`; }}>{t('Help')}</button>}/>
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column', padding: '8px 28px 24px' }}>
        <div style={{ flex: 1, minHeight: 12 }}></div>
        <form onSubmit={submit} noValidate style={{ width: '100%', maxWidth: 360, margin: '0 auto', textAlign: 'center' }}>
          <div className="splash-dot" style={{ width: 18, height: 18, marginBottom: 22 }}></div>
          <Eyebrow style={{ marginBottom: 10 }}>{t('Almost there')}</Eyebrow>
          <h1 className="display" style={{ fontSize: 40, margin: '0 0 10px' }}>
            {isUp ? <>{t('Join')} <Hi>{t('us.')}</Hi></> : <>{t('Get')} <Hi>{t('in.')}</Hi></>}
          </h1>
          <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 28, lineHeight: 1.45, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto', textWrap: 'pretty' }}>
            {t('One account. All your humanoids. Synced across devices.')}
          </div>

          {SOCIAL_LOGIN && <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            <button type="button" data-tap className="btn-auth" onClick={social} style={{ background: 'var(--text)', color: 'var(--bg)', border: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.37 12.73c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.7-3.19-1.72-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.11 8.79.73 1.06 1.6 2.25 2.75 2.2 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.71.71 2.88.69 1.19-.02 1.94-1.08 2.66-2.14.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.32-.89-2.32-3.55zM14.18 6.27c.61-.74 1.02-1.76.91-2.78-.88.04-1.94.58-2.57 1.32-.56.65-1.06 1.7-.93 2.7.98.08 1.98-.5 2.59-1.24z"/></svg>
              {t('Continue with Apple')}
            </button>
            <button type="button" data-tap className="btn-auth" onClick={social}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: 'conic-gradient(#4285F4, #34A853, #FBBC04, #EA4335, #4285F4)' }}></span>
              {t('Continue with Google')}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
            <Eyebrow style={{ color: 'var(--faint)' }}>{t('or')}</Eyebrow>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
          </div>

          </>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {isUp && <input className="field" type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={t('Your name')} aria-label={t('Your name')} autoComplete="name"/>}
            <input className="field" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={t('Email')} aria-label={t('Email')} autoComplete="email" inputMode="email" autoCapitalize="off"/>
            <div style={{ position: 'relative' }}>
              <input className="field" type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                placeholder={t(isUp ? 'Password · min. 8 characters' : 'Password')} aria-label={t('Password')}
                autoComplete={isUp ? 'new-password' : 'current-password'} style={{ width: '100%', paddingRight: 72 }}/>
              <button type="button" onClick={() => setShow(!show)} className="eyebrow"
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                {t(show ? 'Hide' : 'Show')}
              </button>
            </div>
            {isUp && (
              <label className="terms-row">
                <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}/>
                <span className={`terms-box ${terms ? 'on' : ''}`} aria-hidden="true">{terms ? '✓' : ''}</span>
                <span>
                  {t('I accept the')} <a href="/terms.html" target="_blank" rel="noopener">{t('Terms of Service')}</a> {t('and the')}{' '}
                  <a href="/privacy.html" target="_blank" rel="noopener">{t('Privacy Policy')}</a>
                </span>
              </label>
            )}
          </div>

          <div className="auth-err" role="alert">{err}</div>

          <PrimaryBtn full type="submit" disabled={loading}
            style={{ opacity: pw && !loading ? 1 : 0.5, marginBottom: 14, borderRadius: 14, padding: 14 }}>
            {btnLabel}
          </PrimaryBtn>
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--dim)' }}>
            {t(isUp ? 'Have an account? ' : 'New here? ')}
            <button type="button" className="link-btn" data-tap onClick={switchMode} style={{ fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>
              {t(isUp ? 'Sign in' : 'Create account')}
            </button>
          </div>
        </form>
        <div style={{ flex: 1, minHeight: 20 }}></div>
        <div className="eyebrow legal-foot" style={{ fontSize: 9, color: 'var(--faint)', textAlign: 'center', lineHeight: 1.7 }}>
          {t('By continuing you agree to')}<br/>
          <a href="/terms.html" target="_blank" rel="noopener">{t('Terms')}</a> · <a href="/privacy.html" target="_blank" rel="noopener">{t('Privacy Policy')}</a>
        </div>
      </div>
    </div>
  );
}
