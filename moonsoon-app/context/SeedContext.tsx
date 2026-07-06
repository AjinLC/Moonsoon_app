import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { useSession } from './AuthContext';
import { useBirthData } from './BirthDataContext';
import { computeDailySeed, SeedSource } from '@/utils/seed';

interface SeedContextValue {
  seed: number | null;
  seedSource: SeedSource | 'loading';
  refreshSeed: () => Promise<void>;
}

const SeedContext = createContext<SeedContextValue | null>(null);

const todayStr = () => new Date().toISOString().slice(0, 10);

export function SeedProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const { dateOfBirth, timeOfBirth, placeOfBirth, loading: birthLoading } = useBirthData();
  const [seed, setSeed] = useState<number | null>(null);
  const [seedSource, setSeedSource] = useState<SeedSource | 'loading'>('loading');
  const lastDayRef = useRef<string | null>(null);

  const compute = useCallback(async () => {
    if (!user) {
      setSeed(null);
      setSeedSource('loading');
      lastDayRef.current = null;
      return;
    }

    const today = todayStr();
    let lat: number | undefined;
    let lng: number | undefined;

    const hasBirth = !!(dateOfBirth && timeOfBirth && placeOfBirth);
    if (!hasBirth) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getLastKnownPositionAsync({});
          if (pos) {
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          } else {
            const cur = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Lowest,
            });
            lat = cur.coords.latitude;
            lng = cur.coords.longitude;
          }
        }
      } catch {
        // permission denied or no provider — fall through to random
      }
    }

    const result = await computeDailySeed({
      userId: user.id,
      today,
      birthDate: dateOfBirth ?? undefined,
      birthTime: timeOfBirth ? timeOfBirth.slice(0, 5) : undefined,
      birthPlace: placeOfBirth ?? undefined,
      lat,
      lng,
    });
    setSeed(result.seed);
    setSeedSource(result.source);
    lastDayRef.current = today;
  }, [user?.id, dateOfBirth, timeOfBirth, placeOfBirth]);

  useEffect(() => {
    if (birthLoading) return;
    compute();
  }, [compute, birthLoading]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        const today = todayStr();
        if (lastDayRef.current && lastDayRef.current !== today) {
          compute();
        }
      }
    });
    return () => sub.remove();
  }, [compute]);

  return (
    <SeedContext.Provider value={{ seed, seedSource, refreshSeed: compute }}>
      {children}
    </SeedContext.Provider>
  );
}

export function useSeed() {
  const ctx = useContext(SeedContext);
  if (!ctx) throw new Error('useSeed must be used within <SeedProvider>');
  return ctx;
}
