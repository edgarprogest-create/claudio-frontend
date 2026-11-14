export const PLANS = [
  { id: 'essential', tier: 'Essential', price: 15, desc: 'Sonnet model. Solid daily driver.', features: ['350K tokens / week', 'Sonnet model', 'Default, Brother, Health'] },
  { id: 'advanced', tier: 'Advanced', price: 25, featured: true, trial: true, desc: 'Opus model. Humanoid Mode unlocked.', features: ['1.5M tokens / week', 'Opus model', '✦ All 10 humanoids', '24h free trial'] },
  { id: 'everyday', tier: 'Everyday', price: 85, desc: 'Unlimited, fair use. For heavy users.', features: ['Unlimited tokens', 'Opus + priority routing', 'Everything in Advanced'] },
];

/** Display name for the design plan ids (free | trial | essential | advanced | everyday). */
export const PLAN_NAMES = { free: 'Free', trial: 'Advanced · trial', essential: 'Essential', advanced: 'Advanced', everyday: 'Everyday' };
