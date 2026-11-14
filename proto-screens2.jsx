// ───────── HUMANOIDS TAB ─────────
function PersonaGrid({ current, isUnlocked, onPick }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {Object.entries(PERSONAS).map(([id, m]) => {
        const sel = id === current, open = isUnlocked(id);
        return (
          <div key={id} data-tap onClick={() => onPick(id, open)} className={`persona-card${open ? '' : ' locked'}${sel ? ' sel' : ''}`} style={{ '--p': m.color,
            background: sel ? 'var(--accent-soft)' : 'var(--surface)', borderColor: sel ? 'var(--accent)' : 'var(--border)' }}>
            <div style={{ fontSize: 24, color: sel || open ? 'var(--accent)' : 'var(--faint)', lineHeight: 1, marginBottom: 10 }}>{m.glyph}</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 3, letterSpacing: '-0.015em', color: open ? 'var(--text)' : 'var(--dim)' }}>{m.name}</div>
            <div style={{ fontSize: 11, color: 'var(--dim)', lineHeight: 1.35 }}>{t(m.desc)}</div>
            {sel ? <div style={{ position: 'absolute', top: 12, right: 12, color: 'var(--accent)', fontWeight: 700, fontSize: 13 }}>✓</div>
              : !open && <span className="pro-tag" style={{ position: 'absolute', top: 12, right: 12 }}>Pro</span>}
          </div>
        );
      })}
    </div>
  );
}

function ScreenHumanoids({ isUnlocked, newChat, openLocked, plan, goPlans }) {
  return (
    <div className="phone">
      <AppBar mid={<div className="mid">{t('Humanoids')}</div>}/>
      <div className="scroll" style={{ padding: '4px 20px 20px' }}>
        <div style={{ padding: '10px 0 20px' }}>
          <div className="display" style={{ fontSize: 32, marginBottom: 8 }}>{t('Ten angles')} <span className="italic">{t('on you.')}</span></div>
          <div style={{ fontSize: 13.5, color: 'var(--dim)', lineHeight: 1.45 }}>{t('Tap one to start a conversation. You can swap mid-chat.')}</div>
        </div>
        {plan === 'free' && (
          <div data-tap onClick={goPlans} className="upsell" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 22, color: 'var(--accent)' }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t('Unlock all 10 humanoids')}</div>
              <div style={{ fontSize: 12, color: 'var(--accent)' }}>{t('Advanced · 24h free')}</div>
            </div>
            <div style={{ color: 'var(--accent)', fontSize: 18 }}>›</div>
          </div>
        )}
        <PersonaGrid isUnlocked={isUnlocked} onPick={(id, open) => open ? newChat(id) : openLocked(id)}/>
      </div>
    </div>
  );
}

// ───────── SETTINGS ─────────
function useCountdown(active) {
  const [left, setLeft] = useState(22 * 3600 + 14 * 60 + 8);
  useEffect(() => { if (!active) return; const t = setInterval(() => setLeft(l => Math.max(0, l - 1)), 1000); return () => clearInterval(t); }, [active]);
  const p = n => String(n).padStart(2, '0');
  return `${p(Math.floor(left / 3600))}:${p(Math.floor(left / 60) % 60)}:${p(left % 60)}`;
}

const PLAN_INFO = {
  free: { name: 'Free', tokens: '50K', pct: 64 },
  trial: { name: 'Advanced · trial', tokens: '1.5M', pct: 27 },
  essential: { name: 'Essential', tokens: '350K', pct: 31 },
  advanced: { name: 'Advanced', tokens: '1.5M', pct: 27 },
  everyday: { name: 'Everyday', tokens: 'Unlimited', pct: 8 },
};

function ScreenSettings({ style, dark, setDark, plan, goPlans, defaultPersona, openPicker, lang, confirm, signOut }) {
  const countdown = useCountdown(plan === 'trial');
  const info = PLAN_INFO[plan];
  return (
    <div className="phone">
      <AppBar mid={<div className="mid">{t('Settings')}</div>}/>
      <div className="scroll" style={{ padding: '8px 18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div className="avatar">P</div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.025em' }}>Pedro Almeida</div>
            <div style={{ fontSize: 12.5, color: 'var(--dim)' }}>pedro@example.com</div>
          </div>
        </div>
        <div data-tap onClick={goPlans} className="upsell" style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 22, color: 'var(--accent)' }}>✦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{plan === 'free' ? t('Try Advanced free for 24h') : plan === 'trial' ? t('Trial active · Advanced') : `${t('Plan')}: ${t(info.name)}`}</div>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{plan === 'free' ? t('All 10 humanoids · Opus') : plan === 'trial' ? `${countdown} ${t('remaining')}` : t('Manage or change plan')}</div>
          </div>
          <div style={{ color: 'var(--accent)', fontSize: 18 }}>›</div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <Eyebrow>{t("Tokens this week")}</Eyebrow>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{plan === 'everyday' ? t('Unlimited') : <><span style={{ color: 'var(--accent)' }}>{Math.round(info.pct)}%</span> {t('of')} {t(info.tokens)}</>}</div>
          </div>
          <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: info.pct + '%', height: '100%', background: 'var(--accent)', borderRadius: 2, transition: 'width .5s' }}></div>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--faint)', marginTop: 6 }}>{t('Resets Monday')}</div>
        </div>
        <SGroup label="Preferences">
          <SRow label="Style" value={t(STYLES[style].name)} onClick={() => openPicker('style')}/>
          <SRow label="Default humanoid" value={PERSONAS[defaultPersona].name} onClick={() => openPicker('persona')}/>
          <SRow label="Language" value={lang} onClick={() => openPicker('lang')} last/>
        </SGroup>
        <SGroup label="Plan">
          <SRow label="Current plan" value={t(info.name)} onClick={goPlans}/>
          <SRow label="Invoices" onClick={() => toast(plan === 'free' ? 'No invoices yet' : 'Invoice sent to your email')} last/>
        </SGroup>
        <SGroup label="Account">
          <SRow label="Sign out" onClick={() => confirm({ title: 'Sign out?', body: 'Your conversations stay synced to your account.', action: 'Sign out', onConfirm: signOut })}/>
          <SRow label="Delete account" danger last onClick={() => confirm({ title: 'Delete account?', body: 'This permanently erases your account, history and humanoid memory. It cannot be undone.', action: 'Delete', danger: true, onConfirm: () => { signOut(true); toast('Account deleted'); } })}/>
        </SGroup>
        <div className="eyebrow" style={{ fontSize: 9, color: 'var(--faint)', textAlign: 'center', padding: '8px 0' }}>Claudio · 2026.1 · Build 1247</div>
      </div>
    </div>
  );
}

function Switch({ on, onChange }) {
  return <button onClick={e => { e.stopPropagation(); onChange(!on); }} className={`switch ${on ? 'on' : ''}`} aria-pressed={on}><span></span></button>;
}
function SGroup({ label, children }) {
  return <div style={{ marginBottom: 18 }}><Eyebrow style={{ marginBottom: 10 }}>{t(label)}</Eyebrow><div className="card" style={{ overflow: 'hidden' }}>{children}</div></div>;
}
function SRow({ label, value, right, danger, onClick, last }) {
  return (
    <div data-tap onClick={onClick} style={{ display: 'flex', alignItems: 'center', padding: '0 16px', minHeight: 50, borderBottom: last ? 'none' : '1px solid var(--border)', color: danger ? 'var(--error)' : 'var(--text)' }}>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{t(label)}</div>
      {value && <div style={{ fontSize: 13, color: 'var(--dim)', marginRight: 8 }}>{value}</div>}
      {right || <div style={{ color: danger ? 'var(--error)' : 'var(--faint)', fontSize: 16 }}>›</div>}
    </div>
  );
}

// ───────── PLANS ─────────
const PLANS = [
  { id: 'essential', tier: 'Essential', price: 15, desc: 'Sonnet model. Solid daily driver.', features: ['350K tokens / week', 'Sonnet model', 'Default, Brother, Health'] },
  { id: 'advanced', tier: 'Advanced', price: 25, featured: true, desc: 'Opus model. Humanoid Mode unlocked.', features: ['1.5M tokens / week', 'Opus model', '✦ All 10 humanoids', '24h free trial'] },
  { id: 'everyday', tier: 'Everyday', price: 85, desc: 'Unlimited, fair use. For heavy users.', features: ['Unlimited tokens', 'Opus + priority routing', 'Everything in Advanced'] },
];

function ScreenPlans({ back, plan, checkout }) {
  const current = plan === 'trial' ? 'advanced' : plan;
  return (
    <div className="phone">
      <AppBar left={<button className="side" data-tap onClick={back}>{t('← Back')}</button>} mid={<div className="mid">{t('Plans')}</div>}/>
      <div className="scroll" style={{ padding: '14px 20px 30px' }}>
        <Eyebrow style={{ marginBottom: 10 }}>{t("Three ways in")}</Eyebrow>
        <div className="display" style={{ fontSize: 40, marginBottom: 8 }}><span className="italic">{t('Become.')}</span></div>
        <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 24, lineHeight: 1.45 }}>{t('Cancel anytime. Start with 24h free on Advanced.')}</div>
        {PLANS.map(p => {
          const isCur = p.id === current;
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
              <button data-tap disabled={isCur} onClick={() => checkout(p)} className={p.featured ? 'btn-primary' : 'btn-ghost'} style={{ marginTop: 16, width: '100%', opacity: isCur ? 0.45 : 1 }}>
                {isCur ? t('Your plan') : p.id === 'advanced' && plan === 'free' ? t('Start 24h free trial') : current && current !== 'free' ? `${t('Switch to')} ${p.tier}` : t('Subscribe')}
              </button>
            </div>
          );
        })}
        <div className="eyebrow" style={{ fontSize: 9.5, color: 'var(--faint)', textAlign: 'center', padding: '14px 0' }}>{t('Stripe secured · Cancel anytime')}</div>
      </div>
    </div>
  );
}

// ───────── SHEETS ─────────
function CheckoutSheet({ p, plan, onClose, onDone }) {
  const [st, setSt] = useState('review');
  const trial = p.id === 'advanced' && plan === 'free';
  const pay = () => { setSt('paying'); setTimeout(() => setSt('done'), 1300); };
  if (st === 'done') return (
    <Sheet onClose={() => onDone(trial ? 'trial' : p.id)}>
      <div style={{ textAlign: 'center', padding: '16px 0 6px' }}>
        <div className="success-ring">✓</div>
        <div className="display" style={{ fontSize: 30, margin: '18px 0 8px' }}>{t("You're")} <span className="italic">{t('in_checkout')}</span></div>
        <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 22, lineHeight: 1.45 }}>{trial ? t('Advanced is free for the next 24 hours. All 10 humanoids are unlocked.') : `${t("You're now on")} ${p.tier}.`}</div>
        <PrimaryBtn full onClick={() => onDone(trial ? 'trial' : p.id)} style={{ borderRadius: 14, padding: 14 }}>{t("Start talking →")}</PrimaryBtn>
      </div>
    </Sheet>
  );
  return (
    <Sheet onClose={onClose}>
      <Eyebrow style={{ marginBottom: 6 }}>{t("Checkout")}</Eyebrow>
      <div className="display" style={{ fontSize: 28, marginBottom: 18 }}>{p.tier}</div>
      <div className="card" style={{ padding: '4px 16px', marginBottom: 16 }}>
        {[[t(trial ? 'Today' : 'Monthly'), trial ? '€0.00' : `€${p.price}.00`], [t(trial ? 'After 24h' : 'Billed'), trial ? `€${p.price}.00 ${t('/ month')}` : t('Today, then monthly')], [t('Cancel'), t('Anytime, one tap')]].map(([a, b], i) => (
          <div key={a} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', fontSize: 13.5 }}>
            <span style={{ color: 'var(--dim)' }}>{a}</span><span style={{ fontWeight: 600 }}>{b}</span>
          </div>
        ))}
      </div>
      <button data-tap onClick={pay} className="btn-auth" style={{ background: 'var(--text)', color: 'var(--bg)', border: 'none', width: '100%', marginBottom: 10 }}>
        {st === 'paying' ? t('Confirming…') : <><span></span>{t('Pay')}</>}
      </button>
      <button data-tap onClick={onClose} className="btn-ghost" style={{ width: '100%' }}>{t('Not now')}</button>
    </Sheet>
  );
}

function LockedSheet({ id, onClose, goPlans }) {
  const m = PERSONAS[id];
  return (
    <Sheet onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 34, color: 'var(--accent)', lineHeight: 1 }}>{m.glyph}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em' }}>{m.name}</div>
          <div style={{ fontSize: 13, color: 'var(--dim)' }}>{t(m.desc)}</div>
        </div>
      </div>
      <Eyebrow style={{ marginBottom: 8 }}>{t("Sounds like")}</Eyebrow>
      <div className="bubble ai" style={{ maxWidth: '100%', marginBottom: 20 }}>{t(REPLIES[id])}</div>
      <PrimaryBtn full onClick={() => { onClose(); goPlans(); }} style={{ borderRadius: 14, padding: 14, marginBottom: 8 }}>{t("Unlock with Advanced · 24h free")}</PrimaryBtn>
      <button data-tap onClick={onClose} className="btn-ghost" style={{ width: '100%' }}>{t('Not now')}</button>
    </Sheet>
  );
}

function ListSheet({ title, items, onClose }) {
  return (
    <Sheet onClose={onClose}>
      {title && <Eyebrow style={{ marginBottom: 12 }}>{t(title)}</Eyebrow>}
      <div className="card" style={{ overflow: 'hidden' }}>
        {items.map((it, i) => (
          <div key={it.label} data-tap onClick={() => { onClose(); it.onClick(); }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', minHeight: 52, borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', color: it.danger ? 'var(--error)' : 'var(--text)' }}>
            {it.icon && <span style={{ width: 20, textAlign: 'center', color: it.danger ? 'var(--error)' : 'var(--accent)', fontSize: 16 }}>{it.icon}</span>}
            <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500 }}>{t(it.label)}</span>
            {it.check && <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>}
          </div>
        ))}
      </div>
    </Sheet>
  );
}

function RenameSheet({ value, onSave, onClose }) {
  const [v, setV] = useState(value);
  return (
    <Sheet onClose={onClose}>
      <Eyebrow style={{ marginBottom: 12 }}>{t("Rename conversation")}</Eyebrow>
      <input className="field" autoFocus value={v} onChange={e => setV(e.target.value)} onKeyDown={e => e.key === 'Enter' && v.trim() && (onSave(v.trim()), onClose())} style={{ width: '100%', marginBottom: 12 }}/>
      <PrimaryBtn full onClick={() => { if (v.trim()) { onSave(v.trim()); onClose(); } }} style={{ borderRadius: 14, padding: 14 }}>{t("Save")}</PrimaryBtn>
    </Sheet>
  );
}

Object.assign(window, { ScreenHumanoids, ScreenSettings, ScreenPlans, PersonaGrid, CheckoutSheet, LockedSheet, ListSheet, RenameSheet });
