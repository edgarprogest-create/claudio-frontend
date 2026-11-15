export const PLANS = [
  { id: 'essential', tier: 'Essential', price: 9, desc: 'Fast and light. For every day.', features: ['350K tokens / week', 'Fast replies', 'Default, Brother, Health, Academic'] },
  { id: 'advanced', tier: 'Advanced', price: 19, featured: true, trial: true, desc: 'Our smartest mode. All humanoids.', features: ['225K tokens / week', 'Smarter replies', '✦ All 10 humanoids', '24h free'] },
  { id: 'everyday', tier: 'Everyday', price: 85, desc: 'For heavy users. Priority speed.', features: ['1M tokens / week', 'Smartest + priority', 'Everything in Advanced'] },
];

/** Display name for the design plan ids (free | trial | essential | advanced | everyday). */
export const PLAN_NAMES = { free: 'Free', trial: 'Advanced · trial', essential: 'Essential', advanced: 'Advanced', everyday: 'Everyday' };
