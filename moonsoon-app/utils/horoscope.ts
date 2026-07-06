import { createPRNG } from './prng';

export const MANTRAS_POOL: string[] = [
  'I move at the pace of my own knowing.',
  'I trust the slow shape this is taking.',
  'I let the truth I am ready to speak shape the room.',
  'I keep the door open even on the days I do not knock.',
  'I receive what is offered without translating it into a debt.',
  'I build at the pace of what I want to last.',
  'I let small honesties become large doorways.',
  'I am allowed to begin again, quietly.',
  'I notice what is asking for me without performing the answer.',
  'I trust that nothing in me is final.',
  'I let the soft thing be said out loud.',
  'I am the patient witness of my own becoming.',
  'I am not late to my own life.',
  'I make room for the version of me already arriving.',
  'I let the unfinished thing rest, and return.',
  'I take the shape of my own attention.',
  'I let what is heavy be heavy, and put it down on time.',
  'I forgive the part of me that did not yet know.',
  'I let the day hold me as much as I hold it.',
  'I lean into the long game even when no one is watching.',
  'I keep the appointment with myself.',
  'I do not need to translate every feeling into a verdict.',
  'I let care be the smallest unit of my courage.',
  'I am allowed to take the slow road home.',
  'I let the work be both honest and ordinary.',
  'I trust the morning to know what the night could not.',
  'I make peace with the unfinished sentence.',
  'I do not abandon myself to be easier to love.',
  'I let what is mine arrive without bargaining.',
  'I begin where I am, with what I have, and that is enough.',
];

export const ASPECTS_POOL: string[] = [
  'Moon trine Venus',
  'Mars square Saturn',
  'Mercury sextile Neptune',
  'Sun conjunct Jupiter',
  'Venus opposite Pluto',
  'Mars trine Uranus',
  'Moon square Mercury',
  'Sun sextile Saturn',
  'Venus conjunct Moon',
  'Mercury trine Pluto',
  'Mars sextile Jupiter',
  'Saturn trine Sun',
  'Neptune square Mars',
  'Uranus sextile Venus',
  'Pluto trine Mercury',
  'Jupiter conjunct Sun',
  'Moon opposite Saturn',
  'Venus trine Neptune',
  'Mercury square Mars',
  'Sun trine Pluto',
];

const SIGN_OFFSETS: Record<string, number> = {
  aries: 1,
  taurus: 2,
  gemini: 3,
  cancer: 4,
  leo: 5,
  virgo: 6,
  libra: 7,
  scorpio: 8,
  sagittarius: 9,
  capricorn: 10,
  aquarius: 11,
  pisces: 12,
};

export interface DailyHoroscopeParams {
  loveIntensity: number;
  careerIntensity: number;
  energyIntensity: number;
  luckyNumber: number;
  aspectIndex: number;
  mantraIndex: number;
}

export function getDailyHoroscopeParams(seed: number, sunSign: string): DailyHoroscopeParams {
  const offset = SIGN_OFFSETS[sunSign.toLowerCase()] ?? 0;
  const rng = createPRNG(seed + offset);
  const pct = () => Math.floor(rng.next() * 101);
  return {
    loveIntensity: pct(),
    careerIntensity: pct(),
    energyIntensity: pct(),
    luckyNumber: 1 + Math.floor(rng.next() * 99),
    aspectIndex: Math.floor(rng.next() * ASPECTS_POOL.length),
    mantraIndex: Math.floor(rng.next() * MANTRAS_POOL.length),
  };
}

export function sunSignFromDate(iso: string | null | undefined): string {
  if (!iso) return 'aries';
  const [, m, d] = iso.split('-').map((x) => parseInt(x, 10));
  const md = m * 100 + d;
  if (md >= 321 && md <= 419) return 'aries';
  if (md >= 420 && md <= 520) return 'taurus';
  if (md >= 521 && md <= 620) return 'gemini';
  if (md >= 621 && md <= 722) return 'cancer';
  if (md >= 723 && md <= 822) return 'leo';
  if (md >= 823 && md <= 922) return 'virgo';
  if (md >= 923 && md <= 1022) return 'libra';
  if (md >= 1023 && md <= 1121) return 'scorpio';
  if (md >= 1122 && md <= 1221) return 'sagittarius';
  if (md >= 1222 || md <= 119) return 'capricorn';
  if (md >= 120 && md <= 218) return 'aquarius';
  return 'pisces';
}
