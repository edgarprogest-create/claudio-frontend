import { useCallback, useEffect, useState } from 'react';
import { getTrialStatus, getUsage } from '../lib/api.js';
import { PERSONAS } from '../data/personas.js';

const GRACE_KEY = 'claudio_essential_humanoid_start';
// Locked humanoids that Essential unlocks permanently (Advanced / Everyday / trial unlock all).
const ESSENTIAL_HUMANOIDS = ['academic'];
const GRACE_MS = 24 * 60 * 60 * 1000;

/**
 * Plan + humanoid access (hasHumanoidAccess — the backend applies the same rules):
 * - Free: Default, Brother, Health.
 * - Essential: those + Academic (all humanoids during the first 24h after activation).
 * - Advanced / Everyday / an active trial: all humanoids.
 */
export default function usePlan(loggedIn) {
  const [state, setState] = useState({ plan: 'free', inTrial: false, trialEndsAt: null, activatedAt: null, usage: null, loaded: false });

  const refresh = useCallback(async () => {
    if (!loggedIn) { setState(s => ({ ...s, plan: 'free', inTrial: false, usage: null, loaded: true })); return; }
    const [u, tr] = await Promise.allSettled([getUsage(), getTrialStatus()]);
    setState(prev => {
      const next = { ...prev, loaded: true };
      if (u.status === 'fulfilled') {
        const d = u.value || {};
        next.plan = d.plan || 'free';
        next.activatedAt = d.plan_activated_at || null;
        next.usage = { used: d.weeklyUsed || 0, limit: d.weeklyLimit || 0 };
        if (next.plan === 'essential' && !next.activatedAt && !localStorage.getItem(GRACE_KEY)) localStorage.setItem(GRACE_KEY, String(Date.now()));
        if (next.plan !== 'essential') localStorage.removeItem(GRACE_KEY);
      }
      if (tr.status === 'fulfilled') {
        next.inTrial = !!(tr.value?.inTrial && tr.value?.trialEndsAt);
        next.trialEndsAt = next.inTrial ? tr.value.trialEndsAt : null;
      }
      return next;
    });
  }, [loggedIn]);

  useEffect(() => { refresh(); }, [refresh]);

  const { plan, inTrial, activatedAt } = state;
  const graceEnd = (() => {
    if (plan !== 'essential') return 0;
    const start = activatedAt ? new Date(activatedAt).getTime() : parseInt(localStorage.getItem(GRACE_KEY) || '0', 10);
    return start ? start + GRACE_MS : 0;
  })();
  const fullAccess = plan === 'advanced' || plan === 'everyday' || inTrial || Date.now() < graceEnd;
  const isUnlocked = id => !PERSONAS[id]?.locked || fullAccess || (plan === 'essential' && ESSENTIAL_HUMANOIDS.includes(id));
  // Design plan id: free | trial | essential | advanced | everyday
  const uiPlan = inTrial && plan !== 'everyday' ? 'trial' : ['essential', 'advanced', 'everyday'].includes(plan) ? plan : 'free';

  return { ...state, uiPlan, fullAccess, isUnlocked, refresh };
}
