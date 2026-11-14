import { useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { detectPlatform, promptInstall, useInstall } from '../lib/install.js';
import { Sheet, Eyebrow, PrimaryBtn, toast } from './ui.jsx';

const STEPS = {
  android: ['Tap **⋮** in the browser', 'Tap **Add to Home screen**', 'Tap **Install**'],
  ios: ['Tap **Share** in Safari', 'Tap **Add to Home Screen**', 'Tap **Add**'],
};

/** Renders "**bold**" segments of a translated string. */
const bold = s => s.split('**').map((part, i) => (i % 2 ? <b key={i} style={{ color: 'var(--text)' }}>{part}</b> : part));

const AppIcon = ({ size = 44 }) => (
  <img src="/icon-192x192.png" alt="" width={size} height={size} style={{ borderRadius: size * 0.26, flex: '0 0 auto', display: 'block' }}/>
);

/** Home card above "Continue". Hidden once installed or after "Not now". */
export function InstallCard({ onInstall }) {
  const { t } = useI18n();
  const { installed, dismissed, dismiss } = useInstall();
  if (installed || dismissed) return null;
  return (
    <div className="card install-card" style={{ padding: 16, marginBottom: 26, border: '1.5px solid var(--accent)', borderRadius: 18 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
        <AppIcon/>
        <div style={{ minWidth: 0 }}>
          <Eyebrow style={{ color: 'var(--accent)', marginBottom: 4 }}>{t('No app store')}</Eyebrow>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>{t('Install Claudionoid')}</div>
          <div style={{ fontSize: 13, color: 'var(--dim)', lineHeight: 1.45 }}>{t('Free to say anything. Lives on your home screen, not in a store.')}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <PrimaryBtn onClick={onInstall} style={{ padding: '10px 22px', borderRadius: 12 }}>{t('Install')}</PrimaryBtn>
        <button type="button" className="link-btn" data-tap onClick={dismiss} style={{ color: 'var(--dim)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>{t('Not now')}</button>
      </div>
    </div>
  );
}

export default function InstallSheet({ onClose }) {
  const { t } = useI18n();
  const { installed, canPrompt } = useInstall();
  const [platform, setPlatform] = useState(detectPlatform);

  async function install() {
    const outcome = await promptInstall();
    if (outcome === 'accepted') { toast('Claudionoid installed'); onClose(); }
    else if (outcome === 'unavailable') toast('Follow the steps below to install.');
  }

  return (
    <Sheet onClose={onClose} tall>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><AppIcon size={56}/></div>
      <div className="display" style={{ fontSize: 26, textAlign: 'center', marginBottom: 10 }}>
        {t('Not on the Play Store.')}<br/><span style={{ color: 'var(--accent)' }}>{t('On purpose.')}</span>
      </div>
      <div style={{ fontSize: 14, color: 'var(--dim)', lineHeight: 1.5, textAlign: 'center', marginBottom: 20 }}>
        {t('Claudionoid talks to you freely, without app-store gatekeepers. Install it straight from here: same icon, full screen, works offline.')}
      </div>

      <div className="seg" role="tablist" style={{ marginBottom: 16 }}>
        {[['android', 'Android'], ['ios', 'iPhone']].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={platform === id} className={platform === id ? 'on' : ''} data-tap onClick={() => setPlatform(id)}>{label}</button>
        ))}
      </div>

      {installed
        ? <div className="eyebrow" style={{ textAlign: 'center', color: 'var(--accent)', padding: '14px 0', marginBottom: 16 }}>✓ {t('Installed')}</div>
        : <PrimaryBtn full onClick={install} style={{ marginBottom: 18, opacity: canPrompt ? 1 : 0.6 }}>{t('Install app')}</PrimaryBtn>}

      <ol className="install-steps">
        {STEPS[platform].map((s, i) => (
          <li key={s}><span className="install-num">{i + 1}</span><span>{bold(t(s))}</span></li>
        ))}
      </ol>
    </Sheet>
  );
}
