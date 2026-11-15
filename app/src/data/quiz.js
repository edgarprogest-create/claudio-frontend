// Plan quiz: 4 questions, each answer gives 1 point to one plan. A tie for first place favours Advanced.
export const QUIZ = [
  {
    id: 'frequency', q: 'How often will you use Claudionoid?', options: [
      { id: 'weekly', label: 'A few times a week', plan: 'essential' },
      { id: 'daily', label: 'Every day', plan: 'advanced' },
      { id: 'all_day', label: 'All day, for work or study', plan: 'everyday' },
    ],
  },
  {
    id: 'use', q: 'What will you use it for most?', options: [
      { id: 'quick', label: 'Quick questions and everyday help', plan: 'essential' },
      { id: 'humanoids', label: 'Coaching, health, style, dating — the humanoids', plan: 'advanced' },
      { id: 'projects', label: 'Work, studies and long projects', plan: 'everyday' },
    ],
  },
  {
    id: 'length', q: 'How long are your conversations?', options: [
      { id: 'short', label: 'Short — a few messages', plan: 'essential' },
      { id: 'medium', label: 'A real back-and-forth', plan: 'advanced' },
      { id: 'long', label: 'Long — I go deep', plan: 'everyday' },
    ],
  },
  {
    id: 'priority', q: 'What matters most to you?', options: [
      { id: 'price', label: 'The lowest price', plan: 'essential' },
      { id: 'smart', label: 'The smartest answers', plan: 'advanced' },
      { id: 'speed', label: 'Speed and plenty of room', plan: 'everyday' },
    ],
  },
];

export const REASONS = {
  essential: ['350K tokens a week — plenty for everyday use', 'Fast replies', 'Default, Brother, Health and Academic'],
  advanced: ['Our smartest mode', 'All 11 humanoids', 'Try it free for 24 hours'],
  everyday: ['1M tokens a week for long conversations', 'Smartest replies + priority speed', 'Everything in Advanced'],
};

/** answers: { [questionId]: optionId } → { plan, scores } */
export function scoreQuiz(answers) {
  const scores = { essential: 0, advanced: 0, everyday: 0 };
  for (const q of QUIZ) {
    const opt = q.options.find(o => o.id === answers[q.id]);
    if (opt) scores[opt.plan] += 1;
  }
  const top = Math.max(...Object.values(scores));
  const leaders = Object.keys(scores).filter(k => scores[k] === top);
  return { plan: leaders.length > 1 ? 'advanced' : leaders[0], scores };
}
