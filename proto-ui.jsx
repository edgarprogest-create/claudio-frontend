const { useState, useEffect, useRef } = React;

const PERSONAS = {
  default:   { name: 'Default',    desc: 'Natural, balanced chat.',         glyph: '◇', locked: false },
  brother:   { name: 'Brother',    desc: 'No filters. Like a real friend.', glyph: '✺', locked: false },
  health:    { name: 'Health',     desc: 'Symptoms, causes, holistic.',     glyph: '✚', locked: false },
  coaching:  { name: 'Coaching',   desc: 'Direction. Plans. Pressure.',     glyph: '◉', locked: true },
  meal:      { name: 'Meal',       desc: 'Weekly plans, shopping list.',    glyph: '✦', locked: true },
  stylist:   { name: 'Stylist',    desc: 'Style for your body & life.',     glyph: '◈', locked: true },
  spiritual: { name: 'Spiritual',  desc: 'Purpose, energy, presence.',      glyph: '☉', locked: true },
  nomad:     { name: 'Nomad',      desc: 'Jurisdictions, citizenships.',    glyph: '⟁', locked: true },
  looksmax:  { name: 'Looksmax',   desc: 'Photo analysis · glow up.',       glyph: '◐', locked: true },
};

const REPLIES = {
  default:   "Got it. Here's how I'd think about it: 1) clarify the win-condition, 2) cost of inaction, 3) smallest reversible step you can take this week.",
  brother:   "okay. you've been circling this for a while now. just say it out loud — what's actually stopping you?",
  health:    "Three likely drivers I'd rule out first: hydration, screen-time before bed, magnesium. Pick one and run it for 5 days.",
  coaching:  "Stop. We're not doing 'maybe'. Pick one path by Friday. I want the decision in writing, not the deliberation.",
  meal:      "Easy. Mon: oats + berries. Tue: chickpea bowl. Wed: salmon + greens. I'll write the full week + grocery list.",
  stylist:   "Olive oversized tee, straight indigo, white sneaker. Stop overthinking it — your frame works for clean basics.",
  spiritual: "Sit with this for two minutes before you act. Where do you feel it in the body? That's the data.",
  nomad:     "Portugal NHR sunsetting → Italy lump-sum or Cyprus 60-day works for your profile. Want me to map out the trade-offs?",
  looksmax:  "Frame is decent. Lighting is flat — use natural side-light next time and shoot at a 30° angle, not straight on.",
};

const SUGGESTIONS = {
  default:   ['Explain this like I\'m five.', 'Help me plan the next 90 days.', 'Draft a reply to this email.'],
  brother:   ['I think I need to quit my job.', 'Should I text her back?', 'Be honest — am I overthinking this?'],
  health:    ['I keep waking up at 4am.', 'Headache every morning. Why?', 'What should my bloodwork check?'],
  coaching:  ['Hold me to one goal this week.', 'I keep procrastinating on my project.', 'Build me a 30-day plan.'],
  meal:      ['High-protein meals for this week.', 'What can I cook with eggs, rice, spinach?', 'Make me a grocery list under €50.'],
  stylist:   ['What should I wear to a first date?', 'Build me a capsule wardrobe.', 'Which colours suit my skin tone?'],
  spiritual: ['I feel stuck and don\'t know why.', 'Guide me through a 5-minute reset.', 'How do I find my purpose?'],
  nomad:     ['Best countries for low tax residency?', 'How do I get a second passport?', 'Lisbon vs Dubai for remote work.'],
  looksmax:  ['Rate my profile photo.', 'Skincare routine for oily skin.', 'Which haircut suits my face shape?'],
};

const SAMPLE_CONVS = [
  { id: 'c1', title: 'should I quit my corporate job', persona: 'brother', time: '14:22', group: 'Today', messages: [
    { role: 'user', content: 'honest take — should I quit?' },
    { role: 'assistant', content: "okay, real talk.\n\nyou've been asking variations of this for like 3 weeks. that's not the question of someone weighing two solid options — that's someone who already knows.\n\nthree things i'd want to hear first:\n→ runway. how many months?\n→ is there a thing on the other side, or just vibes?\n→ who knows besides me" },
    { role: 'user', content: '8 months runway. yes, the side project hit 2k mrr.' },
    { role: 'assistant', content: 'then bro. what are we even doing.' },
  ] },
  { id: 'c2', title: 'meal plan for the week', persona: 'meal', time: '12:08', group: 'Today', messages: [
    { role: 'user', content: 'plan my meals this week, high protein' },
    { role: 'assistant', content: 'Monday: overnight oats w/ berries. Lunch: chickpea bowl. Dinner: salmon, greens, rice.' } ] },
  { id: 'c3', title: 'why is my python script hanging', persona: 'default', time: '09:14', group: 'Today', messages: [
    { role: 'user', content: 'my asyncio script just hangs forever' },
    { role: 'assistant', content: 'Looks like a deadlock on the event loop. Are you calling a blocking function inside a coroutine?' } ] },
  { id: 'c4', title: 'morning headache + tightness', persona: 'health', time: '08:42', group: 'Yesterday', messages: [
    { role: 'user', content: 'waking up with a headache every day' },
    { role: 'assistant', content: 'Tension headache pattern. Three likely drivers: hydration, jaw clenching, screen time late at night.' } ] },
  { id: 'c5', title: 'budget for moving to Lisbon', persona: 'nomad', time: '18:55', group: 'Yesterday', messages: [
    { role: 'user', content: 'what do I need per month in Lisbon?' },
    { role: 'assistant', content: '€1800/mo base — apartment, food, transport. Add 20% buffer the first three months.' } ] },
  { id: 'c6', title: 'breakup advice (round 3)', persona: 'brother', time: '11:30', group: '14 Mar', messages: [
    { role: 'user', content: 'thinking of texting her again' },
    { role: 'assistant', content: 'honestly? you keep coming back so the answer is clear.' } ] },
  { id: 'c7', title: 'wardrobe refresh autumn', persona: 'stylist', time: '10:12', group: '14 Mar', messages: [
    { role: 'user', content: 'need an autumn wardrobe' },
    { role: 'assistant', content: 'Olive, charcoal, cream. Three jackets max.' } ] },
];

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = window.t ? window.t(msg) : msg;
  t.classList.add('show');
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(() => t.classList.remove('show'), 1800);
}

const Eyebrow = ({ children, style }) => <div className="eyebrow" style={style}>{t(children)}</div>;
const ClaudioMark = () => <span className="claudio-mark">claudio</span>;

function PrimaryBtn({ children, onClick, full, style }) {
  return <button data-tap onClick={onClick} className="btn-primary" style={{ width: full ? '100%' : undefined, ...style }}>{t(children)}</button>;
}

function Sheet({ onClose, children, tall }) {
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose}></div>
      <div className="sheet-inner" style={tall ? { maxHeight: '86%' } : null}>
        <div className="sheet-grab"></div>
        {children}
      </div>
    </>
  );
}

function Confirm({ title, body, action, danger, onConfirm, onClose }) {
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose}></div>
      <div className="dialog">
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>{t(title)}</div>
        <div style={{ fontSize: 13.5, color: 'var(--dim)', lineHeight: 1.45, marginBottom: 18 }}>{t(body)}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button data-tap className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>{t('Cancel')}</button>
          <button data-tap className="btn-primary" style={{ flex: 1, background: danger ? 'var(--error)' : undefined, boxShadow: danger ? 'none' : undefined }}
            onClick={() => { onConfirm(); onClose(); }}>{t(action)}</button>
        </div>
      </div>
    </>
  );
}

function Orb({ size = 200, state = 'idle', onClick }) {
  return (
    <div data-tap={onClick ? '' : undefined} onClick={onClick} className={`orb orb-${state}`} style={{ width: size, height: size }}>
      <div className="orb-core"></div>
      <div className="orb-ring r1"></div>
      <div className="orb-ring r2"></div>
    </div>
  );
}

const ICONS = {
  home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
  history: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  humanoids: <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
};

function TabBar({ active, onChange, onNew }) {
  const tab = (id, label) => (
    <button key={id} className={`tab ${active === id ? 'active' : ''}`} onClick={() => onChange(id)} data-tap>
      <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">{ICONS[id]}</svg>{t(label)}
    </button>
  );
  return (
    <nav className="tabs">
      <div className="tabs-bg" aria-hidden="true">
        <div className="tb-l"></div>
        <div className="tb-c"><svg width="150" height="44" viewBox="0 0 150 44"><path d="M0 0H20C34 0 39 6 44 15C51 30 61 39 75 39C89 39 99 30 106 15C111 6 116 0 130 0H150V44H0Z"/></svg><div></div></div>
        <div className="tb-r"></div>
      </div>
      {tab('home', 'Home')}{tab('history', 'History')}
      <div className="tab-gap"></div>
      <button className="tab-new" data-tap onClick={onNew} aria-label="New chat">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      {tab('humanoids', 'Humanoids')}{tab('settings', 'Settings')}
    </nav>
  );
}

function AppBar({ left, mid, right }) {
  return (
    <>
      <div className="app-pad-top"></div>
      <div className="appbar">
        <div style={{ minWidth: 60, display: 'flex' }}>{left}</div>
        <div>{mid}</div>
        <div style={{ minWidth: 60, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
      </div>
    </>
  );
}

// ───────── Onboarding ─────────
function ScreenSplash({ next }) {
  useEffect(() => { const t = setTimeout(next, 1800); return () => clearTimeout(t); }, []);
  return (
    <div className="phone" onClick={next} style={{ alignItems: 'center' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' }}>
        <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow), transparent 60%)', filter: 'blur(20px)' }}></div>
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div className="splash-dot"></div>
          <div style={{ fontWeight: 700, fontSize: 38, letterSpacing: '-0.045em' }}>Claudionoid</div>
        </div>
      </div>
      <div className="eyebrow" style={{ paddingBottom: 60, color: 'var(--faint)' }}>{t('Loading your humanoids…')}</div>
    </div>
  );
}

const OB_STEPS_FN = () => [
  { eyebrow: '01 · The thesis', title: <>{t('Not one AI.')}<br/><span className="italic">{t('Ten of you.')}</span></>,
    body: t('Most AI apps give you a single, polished assistant. Claudio gives you ten humanoids — each a different angle on you. Brother, Coach, Stylist, Healer.') },
  { eyebrow: '02 · Your roster', title: <>{t('Pick the voice you need')} <span className="italic">{t('today.')}</span></>,
    body: t('Swap mid-conversation. Each humanoid remembers you differently.'), art: 'cards' },
  { eyebrow: '03 · No typing', title: <>{t('Just')} <span className="italic">{t('talk.')}</span></>,
    body: t('Walk. Drive. Lie in bed. Tap the orb and Claudio listens — same humanoid, same memory. Voice in. Voice out.'), art: 'orb' },
  { eyebrow: '04 · The deal', title: <>{t('No tricks.')}<br/><span className="italic">{t('No catches.')}</span></>, art: 'deal' },
];

function ObArt({ kind }) {
  if (kind === 'orb') return <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 40px' }}><Orb size={180} state="idle"/></div>;
  if (kind === 'cards') {
    const cards = [['✺','Brother',10,0,null,-6],['◉','Coach',56,null,14,4],['✚','Health',130,24,null,-3],['☉','Spirit',170,null,0,6],['◈','Stylist',244,40,null,-8],['⟁','Nomad',282,null,24,5]];
    return (
      <div style={{ position: 'relative', height: 350, marginBottom: 8 }}>
        {cards.map(([g, n, top, left, right, rot], i) => (
          <div key={i} className="ob-card" style={{ top, left: left ?? undefined, right: right ?? undefined, transform: `rotate(${rot}deg)`, animationDelay: `${i * 60}ms` }}>
            <div style={{ fontSize: 24, color: 'var(--accent)', lineHeight: 1, marginBottom: 6 }}>{g}</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{n}</div>
            <div className="eyebrow" style={{ fontSize: 8.5, color: 'var(--faint)', marginTop: 4 }}>Humanoid</div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function ScreenOnboarding({ step, setStep, done }) {
  const STEPS = OB_STEPS_FN();
  const s = STEPS[step];
  const last = step === STEPS.length - 1;
  const promises = [
    { glyph: '◇', label: 'Your data', text: 'Never sold. Never trained on. Delete anytime.' },
    { glyph: '✦', label: '24h free', text: 'Try Advanced for a full day. No card upfront.' },
    { glyph: '⟁', label: 'Cancel', text: 'One tap. No phone calls, no retention dance.' },
  ];
  return (
    <div className="phone">
      <AppBar
        left={step > 0 ? <button className="side" data-tap onClick={() => setStep(step - 1)}>{t('← Back')}</button> : null}
        right={!last ? <button className="side" data-tap onClick={done}>{t('Skip')}</button> : null}/>
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column', padding: '12px 28px 20px' }}>
        <div key={step} className="ob-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: s.art ? 'flex-start' : 'center' }}>
          <ObArt kind={s.art}/>
          <Eyebrow style={{ marginBottom: 14 }}>{t(s.eyebrow)}</Eyebrow>
          <div className="display" style={{ fontSize: step === 1 ? 32 : 40, marginBottom: 16 }}>{s.title}</div>
          {s.body && <div style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.5 }}>{s.body}</div>}
          {s.art === 'deal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 14 }}>
              {promises.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ fontSize: 24, color: 'var(--accent)', lineHeight: 1, width: 32 }}>{p.glyph}</div>
                  <div>
                    <Eyebrow style={{ color: 'var(--accent)', marginBottom: 3 }}>{t(p.label)}</Eyebrow>
                    <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.4 }}>{t(p.text)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 18, paddingBottom: 20 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)} aria-label={`Step ${i + 1}`} style={{ width: i === step ? 22 : 6, height: 6, borderRadius: 100, border: 'none', padding: 0, cursor: 'pointer', background: i === step ? 'var(--accent)' : 'var(--border-hi)', transition: 'width .3s' }}></button>
            ))}
          </div>
          <PrimaryBtn onClick={() => last ? done() : setStep(step + 1)}>{t(last ? 'Get started →' : 'Continue →')}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

function ScreenAuth({ back, signIn }) {
  const [email, setEmail] = useState('pedro@example.com');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState('in');
  const [loading, setLoading] = useState(null);
  const go = (via) => { setLoading(via); setTimeout(signIn, 700); };
  return (
    <div className="phone">
      <AppBar left={<button className="side" data-tap onClick={back}>{t('← Back')}</button>}
        right={<button className="side" data-tap onClick={() => toast('help@claudio.app')}>{t('Help')}</button>}/>
      <div className="scroll" style={{ display: 'flex', flexDirection: 'column', padding: '8px 28px 24px' }}>
        <div style={{ flex: 1, minHeight: 12 }}></div>
        <div style={{ width: '100%', maxWidth: 360, margin: '0 auto', textAlign: 'center' }}>
        <div className="splash-dot" style={{ width: 18, height: 18, marginBottom: 22 }}></div>
        <Eyebrow style={{ marginBottom: 10 }}>{t("Almost there")}</Eyebrow>
        <div className="display" style={{ fontSize: 40, marginBottom: 10 }}>{mode === 'in' ? <>{t('Get')} <span className="italic">{t('in.')}</span></> : <>{t('Join')} <span className="italic">{t('us.')}</span></>}</div>
        <div style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 28, lineHeight: 1.45, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto', textWrap: 'pretty' }}>{t('One account. All your humanoids. Synced across devices.')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          <button data-tap className="btn-auth" onClick={() => go('apple')} style={{ background: 'var(--text)', color: 'var(--bg)', border: 'none' }}>
            {loading === 'apple' ? t('Signing in…') : <><span></span>{t('Continue with Apple')}</>}
          </button>
          <button data-tap className="btn-auth" onClick={() => go('google')}>
            {loading === 'google' ? t('Signing in…') : <><span style={{ width: 16, height: 16, borderRadius: 4, background: 'conic-gradient(#4285F4, #34A853, #FBBC04, #EA4335, #4285F4)' }}></span>{t('Continue with Google')}</>}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 14px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
          <Eyebrow style={{ color: 'var(--faint)' }}>{t("or")}</Eyebrow>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          <input className="field" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"/>
          <div style={{ position: 'relative' }}>
            <input className="field" type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder={t('Password')} style={{ width: '100%', paddingRight: 64 }}
              onKeyDown={e => e.key === 'Enter' && pw && go('email')}/>
            <button onClick={() => setShow(!show)} className="eyebrow" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>{t(show ? 'Hide' : 'Show')}</button>
          </div>
        </div>
        <PrimaryBtn full onClick={() => pw ? go('email') : toast('Enter a password')} style={{ opacity: pw ? 1 : 0.5, marginBottom: 14, borderRadius: 14, padding: 14 }}>
          {t(loading === 'email' ? 'Signing in…' : mode === 'in' ? 'Sign in →' : 'Create account →')}
        </PrimaryBtn>
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--dim)' }}>
          {t(mode === 'in' ? 'New here? ' : 'Have an account? ')}
          <span data-tap onClick={() => setMode(mode === 'in' ? 'up' : 'in')} style={{ color: 'var(--accent)', fontWeight: 600 }}>{t(mode === 'in' ? 'Create account' : 'Sign in')}</span>
        </div>
        </div>
        <div style={{ flex: 1, minHeight: 20 }}></div>
        <div className="eyebrow" style={{ fontSize: 9, color: 'var(--faint)', textAlign: 'center', lineHeight: 1.7 }}>{t('By continuing you agree to')}<br/>{t('our Terms · Privacy Policy')}</div>
      </div>
    </div>
  );
}

Object.assign(window, { PERSONAS, REPLIES, SUGGESTIONS, SAMPLE_CONVS, toast, Eyebrow, ClaudioMark, PrimaryBtn, Sheet, Confirm, Orb, TabBar, AppBar, ScreenSplash, ScreenOnboarding, ScreenAuth });
