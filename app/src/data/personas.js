export const PERSONAS = {
  default:   { name: 'Default',   desc: 'Natural, balanced chat.',         glyph: '◇', color: '#e9e9ee', locked: false },
  brother:   { name: 'Brother',   desc: 'No filters. Like a real friend.', glyph: '✺', color: '#ff8a50', locked: false },
  health:    { name: 'Health',    desc: 'Symptoms, causes, holistic.',     glyph: '✚', color: '#43e0a0', locked: false },
  academic:  { name: 'Academic',  desc: 'Study, research, essays.',        glyph: '✎', color: '#5ec2ff', locked: true }, // unlocked on Essential too
  coaching:  { name: 'Coaching',  desc: 'Direction. Plans. Pressure.',     glyph: '◉', color: '#7c9cff', locked: true },
  meal:      { name: 'Meal',      desc: 'Weekly plans, shopping list.',    glyph: '✦', color: '#ffd166', locked: true },
  stylist:   { name: 'Stylist',   desc: 'Style for your body & life.',     glyph: '◈', color: '#ff6fae', locked: true },
  spiritual: { name: 'Spiritual', desc: 'Purpose, energy, presence.',      glyph: '☉', color: '#b69cff', locked: true },
  nomad:     { name: 'Nomad',     desc: 'Jurisdictions, citizenships.',    glyph: '⟁', color: '#3dd6c6', locked: true },
  looksmax:  { name: 'Looksmax',  desc: 'Photo analysis · glow up.',       glyph: '◐', color: '#f4a261', locked: true },
  dating:    { name: 'Dating',    desc: 'Profiles, first texts, first dates.', glyph: '♡', color: '#ff5c7a', locked: true },
};

export const SUGGESTIONS = {
  default:   ["Explain this like I'm five.", 'Help me plan the next 90 days.', 'Draft a reply to this email.'],
  brother:   ['I think I need to quit my job.', 'Should I text her back?', 'Be honest — am I overthinking this?'],
  health:    ['I keep waking up at 4am.', 'Headache every morning. Why?', 'What should my bloodwork check?'],
  academic:  ['Explain this concept step by step.', 'Quiz me before my exam.', 'Help me outline my essay.'],
  coaching:  ['Hold me to one goal this week.', 'I keep procrastinating on my project.', 'Build me a 30-day plan.'],
  meal:      ['High-protein meals for this week.', 'What can I cook with eggs, rice, spinach?', 'Make me a grocery list under €50.'],
  stylist:   ['What should I wear to a first date?', 'Build me a capsule wardrobe.', 'Which colours suit my skin tone?'],
  spiritual: ["I feel stuck and don't know why.", 'Guide me through a 5-minute reset.', 'How do I find my purpose?'],
  nomad:     ['Best countries for low tax residency?', 'How do I get a second passport?', 'Lisbon vs Dubai for remote work.'],
  looksmax:  ['Rate my profile photo.', 'Skincare routine for oily skin.', 'Which haircut suits my face shape?'],
  dating:    ['Rewrite my dating profile bio.', 'What should I text after the first date?', 'Plan a first date under €30.'],
};

// Sample reply shown in the Locked sheet ("Sounds like").
export const REPLIES = {
  default:   "Got it. Here's how I'd think about it: 1) clarify the win-condition, 2) cost of inaction, 3) smallest reversible step you can take this week.",
  brother:   "okay. you've been circling this for a while now. just say it out loud — what's actually stopping you?",
  health:    "Three likely drivers I'd rule out first: hydration, screen-time before bed, magnesium. Pick one and run it for 5 days.",
  academic:  "Let's break it into three parts: the core idea, one worked example, then two quick questions to check you've got it. Ready?",
  coaching:  "Stop. We're not doing 'maybe'. Pick one path by Friday. I want the decision in writing, not the deliberation.",
  meal:      "Easy. Mon: oats + berries. Tue: chickpea bowl. Wed: salmon + greens. I'll write the full week + grocery list.",
  stylist:   "Olive oversized tee, straight indigo, white sneaker. Stop overthinking it — your frame works for clean basics.",
  spiritual: "Sit with this for two minutes before you act. Where do you feel it in the body? That's the data.",
  nomad:     "Portugal NHR sunsetting → Italy lump-sum or Cyprus 60-day works for your profile. Want me to map out the trade-offs?",
  looksmax:  "Frame is decent. Lighting is flat — use natural side-light next time and shoot at a 30° angle, not straight on.",
  dating:    "Your bio lists traits — show one instead. Swap 'I love travel' for the trip story that still makes you laugh. Want three versions to pick from?",
};

/** Map ids stored by the old app (looksmax-m / looksmax-f) to the merged persona. */
export function normalizePersona(id) {
  if (id === 'looksmax-m' || id === 'looksmax-f') return 'looksmax';
  return PERSONAS[id] ? id : 'default';
}
