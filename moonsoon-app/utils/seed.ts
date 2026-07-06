import AsyncStorage from '@react-native-async-storage/async-storage';

export type SeedSource = 'birth' | 'location' | 'random';

export interface SeedResult {
  seed: number;
  source: SeedSource;
}

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function uuid(): string {
  // RFC4122-ish v4 without depending on global crypto (RN < expo-crypto)
  const r = () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, '0');
  return `${r()}${r()}-${r()}-4${r().slice(1)}-${(Math.floor(Math.random() * 4) + 8).toString(16)}${r().slice(1)}-${r()}${r()}${r()}`;
}

export async function computeDailySeed(params: {
  userId: string;
  today: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  lat?: number;
  lng?: number;
}): Promise<SeedResult> {
  const { userId, today, birthDate, birthTime, birthPlace, lat, lng } = params;

  if (birthDate && birthTime && birthPlace) {
    return {
      seed: djb2(`${userId}|${today}|${birthDate}|${birthTime}|${birthPlace}`),
      source: 'birth',
    };
  }

  if (typeof lat === 'number' && typeof lng === 'number') {
    return {
      seed: djb2(`${userId}|${today}|${lat.toFixed(2)}|${lng.toFixed(2)}`),
      source: 'location',
    };
  }

  const key = `seed_fallback_${userId}_${today}`;
  let token = await AsyncStorage.getItem(key);
  if (!token) {
    token = uuid();
    await AsyncStorage.setItem(key, token);
  }
  return { seed: djb2(`${userId}|${today}|${token}`), source: 'random' };
}
