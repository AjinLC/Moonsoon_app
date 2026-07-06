import { createPRNG } from './prng';

export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';

export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit?: Suit;
  keywords: string[];
  keywordsReversed: string[];
  description: string;
}

export interface DrawnCard extends TarotCard {
  reversed: boolean;
}

const MAJOR: TarotCard[] = [
  {
    id: 'major-00',
    name: 'The Fool',
    arcana: 'major',
    keywords: ['Beginnings', 'Innocence', 'Adventure'],
    keywordsReversed: ['Recklessness', 'Hesitation', 'Naïveté'],
    description: 'A fresh start asks for trust before evidence.',
  },
  {
    id: 'major-01',
    name: 'The Magician',
    arcana: 'major',
    keywords: ['Will', 'Skill', 'Manifestation'],
    keywordsReversed: ['Manipulation', 'Doubt', 'Untapped talent'],
    description: 'You already hold the tools; the work is in the using.',
  },
  {
    id: 'major-02',
    name: 'The High Priestess',
    arcana: 'major',
    keywords: ['Intuition', 'Mystery', 'Inner voice'],
    keywordsReversed: ['Secrets', 'Disconnection', 'Withheld truth'],
    description: 'Knowledge that refuses to be argued, only listened to.',
  },
  {
    id: 'major-03',
    name: 'The Empress',
    arcana: 'major',
    keywords: ['Abundance', 'Care', 'Earned softness'],
    keywordsReversed: ['Stagnation', 'Dependence', 'Smothering'],
    description: 'Receive what is offered without translating it into a debt.',
  },
  {
    id: 'major-04',
    name: 'The Emperor',
    arcana: 'major',
    keywords: ['Structure', 'Authority', 'Stability'],
    keywordsReversed: ['Rigidity', 'Control', 'Coldness'],
    description: 'Order serves freedom; freedom serves the order.',
  },
  {
    id: 'major-05',
    name: 'The Hierophant',
    arcana: 'major',
    keywords: ['Tradition', 'Teaching', 'Belonging'],
    keywordsReversed: ['Rebellion', 'Dogma', 'Outgrown beliefs'],
    description: 'A long-held path can still surprise the one who walks it.',
  },
  {
    id: 'major-06',
    name: 'The Lovers',
    arcana: 'major',
    keywords: ['Choice', 'Union', 'Alignment'],
    keywordsReversed: ['Discord', 'Indecision', 'Misalignment'],
    description: 'Choose what you would still choose without an audience.',
  },
  {
    id: 'major-07',
    name: 'The Chariot',
    arcana: 'major',
    keywords: ['Drive', 'Discipline', 'Forward motion'],
    keywordsReversed: ['Scattered', 'Stalled', 'Aggression'],
    description: 'Hold the reins of competing impulses; one direction wins.',
  },
  {
    id: 'major-08',
    name: 'Strength',
    arcana: 'major',
    keywords: ['Courage', 'Composure', 'Inner power'],
    keywordsReversed: ['Self-doubt', 'Brittleness', 'Force'],
    description: 'Power that does not need to raise its voice.',
  },
  {
    id: 'major-09',
    name: 'The Hermit',
    arcana: 'major',
    keywords: ['Solitude', 'Reflection', 'Inner light'],
    keywordsReversed: ['Isolation', 'Loneliness', 'Avoidance'],
    description: 'Some answers only arrive when you stop asking out loud.',
  },
  {
    id: 'major-10',
    name: 'Wheel of Fortune',
    arcana: 'major',
    keywords: ['Cycles', 'Change', 'Turning point'],
    keywordsReversed: ['Setbacks', 'Resistance', 'Unlucky timing'],
    description: 'The wheel keeps moving; arrange yourself accordingly.',
  },
  {
    id: 'major-11',
    name: 'Justice',
    arcana: 'major',
    keywords: ['Truth', 'Fairness', 'Cause and effect'],
    keywordsReversed: ['Bias', 'Avoidance', 'Imbalance'],
    description: 'What was set in motion is meeting you now.',
  },
  {
    id: 'major-12',
    name: 'The Hanged Man',
    arcana: 'major',
    keywords: ['Suspension', 'New angle', 'Surrender'],
    keywordsReversed: ['Stalling', 'Sacrifice without reason', 'Stuck'],
    description: 'A pause that turns the picture the right way up.',
  },
  {
    id: 'major-13',
    name: 'Death',
    arcana: 'major',
    keywords: ['Transformation', 'Endings', 'Threshold'],
    keywordsReversed: ['Resistance', 'Unfinished grief', 'Stagnation'],
    description: 'Something is finishing so something honest can begin.',
  },
  {
    id: 'major-14',
    name: 'Temperance',
    arcana: 'major',
    keywords: ['Balance', 'Patience', 'Blending'],
    keywordsReversed: ['Extremes', 'Imbalance', 'Haste'],
    description: 'Two opposites become one usable thing if you stay with it.',
  },
  {
    id: 'major-15',
    name: 'The Devil',
    arcana: 'major',
    keywords: ['Attachment', 'Shadow', 'Desire'],
    keywordsReversed: ['Release', 'Awareness', 'Breaking free'],
    description: 'The chain is loose; you forgot you were holding it.',
  },
  {
    id: 'major-16',
    name: 'The Tower',
    arcana: 'major',
    keywords: ['Rupture', 'Truth', 'Necessary collapse'],
    keywordsReversed: ['Avoided collapse', 'Delay', 'Fear of change'],
    description: 'What was built on a fault line is coming apart.',
  },
  {
    id: 'major-17',
    name: 'The Star',
    arcana: 'major',
    keywords: ['Hope', 'Renewal', 'Quiet faith'],
    keywordsReversed: ['Discouragement', 'Doubt', 'Disconnection'],
    description: 'After the storm, an exhale you can rest inside.',
  },
  {
    id: 'major-18',
    name: 'The Moon',
    arcana: 'major',
    keywords: ['Intuition', 'Illusion', 'Subconscious'],
    keywordsReversed: ['Confusion released', 'Truth', 'Clarity'],
    description: 'Walk a path that is not fully lit, and keep walking.',
  },
  {
    id: 'major-19',
    name: 'The Sun',
    arcana: 'major',
    keywords: ['Joy', 'Vitality', 'Clarity'],
    keywordsReversed: ['Dimmed light', 'Self-doubt', 'Burnout'],
    description: 'Warmth that is allowed without earning it first.',
  },
  {
    id: 'major-20',
    name: 'Judgement',
    arcana: 'major',
    keywords: ['Awakening', 'Reckoning', 'Calling'],
    keywordsReversed: ['Self-criticism', 'Avoidance', 'Doubt'],
    description: 'A summons that recognises the version of you ready to answer.',
  },
  {
    id: 'major-21',
    name: 'The World',
    arcana: 'major',
    keywords: ['Completion', 'Wholeness', 'Arrival'],
    keywordsReversed: ['Loose ends', 'Unfinished', 'Premature closing'],
    description: 'A circle closing — and the next one already drawing.',
  },
];

const SUITS: {
  suit: Suit;
  theme: string;
  positive: string[];
  negative: string[];
  arc: string[];
}[] = [
  {
    suit: 'wands',
    theme: 'will, energy, action',
    positive: [
      'Drive',
      'Spark',
      'Ambition',
      'Inspiration',
      'Courage',
      'Creation',
      'Movement',
      'Heat',
      'Initiative',
      'Audacity',
    ],
    negative: [
      'Burnout',
      'Impatience',
      'Friction',
      'Recklessness',
      'Stalling',
      'Conflict',
      'Hesitation',
      'Excess',
      'Heat without aim',
      'Distraction',
    ],
    arc: [
      'A spark, before it knows what it is for.',
      'A choice between two horizons.',
      'A first plan put into motion.',
      'A small celebration of solid ground.',
      'A clash that sharpens you.',
      'A win seen by others.',
      'A position to defend — and worth defending.',
      'A message moving fast across distance.',
      'A short rest that earns the next push.',
      'A weight you no longer have to carry alone.',
    ],
  },
  {
    suit: 'cups',
    theme: 'emotion, relationship, inner life',
    positive: [
      'Tenderness',
      'Connection',
      'Intuition',
      'Love',
      'Gratitude',
      'Reunion',
      'Compassion',
      'Trust',
      'Nostalgia',
      'Belonging',
    ],
    negative: [
      'Withdrawal',
      'Disappointment',
      'Avoidance',
      'Self-pity',
      'Drift',
      'Old wound',
      'Idealisation',
      'Distance',
      'Closed heart',
      'Inertia',
    ],
    arc: [
      'A quiet feeling, just arriving.',
      'A meeting of equals.',
      'A small, unforced joy.',
      'A pause to notice what is offered.',
      'A loss that asks to be honoured.',
      'A returning memory.',
      'A choice between many tempting paths.',
      'A leaving that opens room.',
      'A wish made true on its own time.',
      'A long-held love steadied by years.',
    ],
  },
  {
    suit: 'swords',
    theme: 'thought, conflict, clarity',
    positive: [
      'Clarity',
      'Truth',
      'Insight',
      'Resolve',
      'Honesty',
      'Cut-through',
      'Justice',
      'Discernment',
      'Focus',
      'Decision',
    ],
    negative: [
      'Anxiety',
      'Overthinking',
      'Cruelty',
      'Indecision',
      'Restless mind',
      'Stalemate',
      'Self-attack',
      'Cold logic',
      'Disillusion',
      'Exhaustion',
    ],
    arc: [
      'A blade lifted at first light.',
      'A standoff that asks who blinks first.',
      'A grief grown precise.',
      'A rest the mind has earned.',
      'A win you may not be proud of.',
      'A move toward calmer water.',
      'A plan kept too quiet.',
      'A self-made cage with the key in your pocket.',
      'A long night of the mind, and dawn coming.',
      'A reckoning that ends a long pretence.',
    ],
  },
  {
    suit: 'pentacles',
    theme: 'body, work, the material world',
    positive: [
      'Craft',
      'Stability',
      'Patience',
      'Wealth',
      'Health',
      'Care',
      'Apprenticeship',
      'Inheritance',
      'Reward',
      'Endurance',
    ],
    negative: [
      'Scarcity',
      'Greed',
      'Stagnation',
      'Insecurity',
      'Drudgery',
      'Missed opportunity',
      'Hoarding',
      'Burnout',
      'Loss',
      'Drift',
    ],
    arc: [
      'A first coin held in an open hand.',
      'A balancing act between two demands.',
      'A craft starting to find its rhythm.',
      'A grip held a little too tightly.',
      'A cold spell that ends.',
      'A generosity given and received.',
      'A pause to evaluate what is growing.',
      'A patient apprenticeship.',
      'A garden that finally feeds you.',
      'A long arc of family and work, well kept.',
    ],
  },
];

const COURT = ['Page', 'Knight', 'Queen', 'King'] as const;
const COURT_KEYWORDS: Record<
  (typeof COURT)[number],
  { positive: string[]; negative: string[]; arc: string }
> = {
  Page: {
    positive: ['Curiosity', 'Promise', 'Beginnings'],
    negative: ['Distraction', 'Immaturity', 'Idle talk'],
    arc: 'A messenger in early form — the news matters more than the messenger.',
  },
  Knight: {
    positive: ['Drive', 'Pursuit', 'Mission'],
    negative: ['Recklessness', 'Tunnel vision', 'Burnout'],
    arc: 'A pursuit that defines you for a season — pace yourself.',
  },
  Queen: {
    positive: ['Mastery', 'Care', 'Inner authority'],
    negative: ['Cold', 'Withdrawn', 'Self-effacing'],
    arc: 'A presence that does not need to perform itself.',
  },
  King: {
    positive: ['Authority', 'Vision', 'Stewardship'],
    negative: ['Rigidity', 'Distance', 'Power without listening'],
    arc: 'A long arc completed, and a wider one to hold.',
  },
};

function buildMinor(): TarotCard[] {
  const out: TarotCard[] = [];
  for (const suitDef of SUITS) {
    // Ace through Ten
    for (let n = 1; n <= 10; n++) {
      const idx = n - 1;
      const num = String(n).padStart(2, '0');
      const rank = n === 1 ? 'Ace' : String(n);
      out.push({
        id: `${suitDef.suit}-${num}`,
        name: `${rank} of ${suitDef.suit[0].toUpperCase()}${suitDef.suit.slice(1)}`,
        arcana: 'minor',
        suit: suitDef.suit,
        keywords: [
          suitDef.positive[idx],
          suitDef.positive[(idx + 3) % suitDef.positive.length],
          suitDef.positive[(idx + 6) % suitDef.positive.length],
        ],
        keywordsReversed: [
          suitDef.negative[idx],
          suitDef.negative[(idx + 3) % suitDef.negative.length],
          suitDef.negative[(idx + 6) % suitDef.negative.length],
        ],
        description: suitDef.arc[idx],
      });
    }
    // Court cards
    for (let c = 0; c < COURT.length; c++) {
      const role = COURT[c];
      const num = String(11 + c).padStart(2, '0');
      const k = COURT_KEYWORDS[role];
      out.push({
        id: `${suitDef.suit}-${num}`,
        name: `${role} of ${suitDef.suit[0].toUpperCase()}${suitDef.suit.slice(1)}`,
        arcana: 'minor',
        suit: suitDef.suit,
        keywords: k.positive,
        keywordsReversed: k.negative,
        description: `${k.arc} (${suitDef.theme})`,
      });
    }
  }
  return out;
}

export const TAROT_DECK: TarotCard[] = [...MAJOR, ...buildMinor()];

export function drawCards(seed: number, n = 3, allowReversed = true): DrawnCard[] {
  if (n < 1) return [];
  const rng = createPRNG(seed);
  const deck = [...TAROT_DECK];
  // Fisher-Yates partial shuffle
  for (let i = deck.length - 1; i > deck.length - 1 - n && i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  const picked = deck.slice(deck.length - n);
  return picked.map((card) => ({
    ...card,
    reversed: allowReversed ? rng.next() < 0.5 : false,
  }));
}

export function getCardById(id: string): TarotCard | undefined {
  return TAROT_DECK.find((c) => c.id === id);
}
