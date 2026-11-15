import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/index.jsx';
import { PLANS } from '../data/plans.js';
import { QUIZ, REASONS, scoreQuiz } from '../data/quiz.js';
import { track } from '../lib/analytics.js';
import { Eyebrow, Hi, PrimaryBtn, Sheet } from './ui.jsx';

/**
 * "Which plan is right for me?" — 4 questions, one per screen, auto-advance on tap.
 * Result: recommended plan + 3 reasons, opening the embedded checkout for that plan.
 * plan: the user's design plan id (free | trial | essential | advanced | everyday).
 */
export default function QuizSheet({ plan, onClose, onCheckout }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);         // 0..QUIZ.length (QUIZ.length = result)
  const [answers, setAnswers] = useState({});
  const [picked, setPicked] = useState(null);  // option briefly highlighted before advancing
  const [result, setResult] = useState(null);
  const timer = useRef(null);

  useEffect(() => { track('quiz_started', { current_plan: plan }); return () => clearTimeout(timer.current); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const q = QUIZ[step];
  const total = QUIZ.length;

  function choose(opt) {
    if (picked) return;
    setPicked(opt.id);
    const next = { ...answers, [q.id]: opt.id };
    setAnswers(next);
    timer.current = setTimeout(() => {
      setPicked(null);
      if (step + 1 < total) { setStep(step + 1); return; }
      const r = scoreQuiz(next);
      setResult(r);
      setStep(total);
      track('quiz_completed', { recommended: r.plan, answers: next, scores: r.scores, current_plan: plan });
    }, 220);
  }

  const back = () => { clearTimeout(timer.current); setPicked(null); setStep(s => Math.max(0, s - 1)); };
  const retake = () => { track('quiz_retake', { previous: result?.plan }); setAnswers({}); setResult(null); setStep(0); };

  // ── Result ──
  if (result) {
    const p = PLANS.find(x => x.id === result.plan);
    const current = plan === 'trial' ? 'advanced' : plan;
    const isCur = p.id === current;
    const cta = isCur ? t('Your plan')
      : p.trial && plan === 'free' ? t('Start 24h free trial')
      : current !== 'free' ? `${t('Switch to')} ${p.tier}` : `${t('Choose')} ${p.tier}`;
    return (
      <Sheet onClose={onClose} tall>
        <Eyebrow style={{ marginBottom: 6 }}>{t('Your match')}</Eyebrow>
        <div className="display" style={{ fontSize: 28, marginBottom: 16 }}>{t('We recommend')} <Hi>{p.tier}.</Hi></div>
        <div className="plan-card" style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent)', marginBottom: 16 }}>
          <Eyebrow>{t(p.tier)}</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '6px 0 12px' }}>
            <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--accent)' }}>€{p.price}</span>
            <span style={{ fontSize: 13, color: 'var(--dim)' }}>{t('/month')}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REASONS[p.id].map(r => (
              <div key={r} style={{ fontSize: 13.5, display: 'flex', gap: 8, color: 'var(--text-2)', lineHeight: 1.4 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>{t(r)}
              </div>
            ))}
          </div>
        </div>
        <PrimaryBtn full disabled={isCur} style={{ padding: 15, borderRadius: 14, marginBottom: 10, opacity: isCur ? 0.45 : 1 }}
          onClick={() => { track('quiz_checkout', { plan: p.id, current_plan: plan }); onCheckout(p); }}>{cta}</PrimaryBtn>
        <div style={{ display: 'flex', gap: 8 }}>
          <button data-tap className="btn-ghost" style={{ flex: 1 }} onClick={retake}>{t('Retake')}</button>
          <button data-tap className="btn-ghost" style={{ flex: 1 }} onClick={() => { track('quiz_see_all_plans', { recommended: p.id }); onClose(); }}>{t('See all plans')}</button>
        </div>
      </Sheet>
    );
  }

  // ── Questions ──
  return (
    <Sheet onClose={onClose} tall>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, minHeight: 22 }}>
        {step > 0
          ? <button type="button" className="link-btn eyebrow" data-tap onClick={back} style={{ fontFamily: 'inherit' }}>{t('← Back')}</button>
          : <Eyebrow>{t('Plan quiz')}</Eyebrow>}
        <Eyebrow style={{ color: 'var(--dim)' }}>{step + 1} / {total}</Eyebrow>
      </div>
      <div className="quiz-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={step + 1}>
        <div style={{ width: `${((step + 1) / total) * 100}%` }}></div>
      </div>
      <div key={q.id} className="anim-fade">
        <div className="display" style={{ fontSize: 26, margin: '22px 0 18px' }}>{t(q.q)}</div>
        <div role="radiogroup" aria-label={t(q.q)} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map(o => {
            const on = picked ? picked === o.id : answers[q.id] === o.id;
            return (
              <button key={o.id} type="button" role="radio" aria-checked={on} data-tap
                className={`card quiz-opt${on ? ' on' : ''}`} onClick={() => choose(o)}>
                <span style={{ flex: 1 }}>{t(o.label)}</span>
                <span className="lang-check" aria-hidden="true">{on ? '✓' : ''}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
