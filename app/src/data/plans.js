export const PLANS = [
  { id: 'essential', tier: 'Essential', price: 15, desc: 'Haiku model. Fast and light, every day.', features: ['350K tokens / week · Haiku', 'Default, Brother, Health'] },
  { id: 'advanced', tier: 'Advanced', price: 25, featured: true, trial: true, desc: 'Sonnet model. Humanoid Mode unlocked.', features: ['300K tokens / week · Sonnet', '✦ All 10 humanoids', '24h free trial'] },
  { id: 'everyday', tier: 'Everyday', price: 85, desc: 'Sonnet with priority. For heavy users.', features: ['1M tokens / week · Sonnet + priority', 'Everything in Advanced'] },
];

/** Display name for the design plan ids (free | trial | essential | advanced | everyday). */
export const PLAN_NAMES = { free: 'Free', trial: 'Advanced · trial', essential: 'Essential', advanced: 'Advanced', everyday: 'Everyday' };
