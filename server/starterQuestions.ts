// Real questions people commonly ask when learning a trade, written by the TogetherWeGrow team.
// They are labeled as common questions, never as coming from a particular person.

const q = (id: string, trade: string, who: string, text: string) => ({
  id,
  trade,
  askerLabel: `Often asked by ${who}`,
  text,
  isStarter: true,
  createdAt: "2026-01-01T00:00:00.000Z",
});

export const STARTER_QUESTIONS = [
  q("q-repair", "Home repair", "people learning home repairs", "How can you tell when a repair has been done properly?"),
  q("q-wood", "Carpentry", "apprentice carpenters", "My cuts keep drifting off the line. What am I doing wrong with the saw?"),
  q("q-plumb", "Plumbing", "people fixing up their first apartment", "A faucet keeps dripping even after I changed the washer. What should I check next?"),
  q("q-weld", "Welding", "welding students", "How do you know when a weld is strong, just by looking at it?"),
  q("q-mech", "Mechanics", "people learning to look after their car", "What sounds from an engine mean I should stop driving right away?"),
  q("q-cook", "Cooking", "new line cooks", "How do you keep calm and organized when every order comes in at once?"),
  q("q-garden", "Gardening & farming", "people starting a vegetable plot", "How do you know when soil is ready for planting?"),
  q("q-books", "Small business", "people opening a small business", "What's the simplest way to keep track of money coming in and going out?"),
  q("q-sew", "Sewing & tailoring", "students learning to sew", "How do I stop fabric from puckering when I sew a seam?"),
  q("q-paint", "Painting & decorating", "people painting their home for the first time", "Why does my paint look streaky, and how do pros get a smooth finish?"),
  q("q-safe", "Workplace safety", "first-year construction workers", "What's one safety habit you wish someone had taught you on your first day?"),
  q("q-work", "Working life", "people starting their first full-time job", "How do you earn the respect of people who've been there much longer than you?"),
];
