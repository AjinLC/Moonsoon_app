import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useSession } from './AuthContext';

export interface BirthData {
  name: string | null;
  dateOfBirth: string | null; // YYYY-MM-DD
  timeOfBirth: string | null; // HH:MM:SS
  placeOfBirth: string | null;
  onboardingComplete: boolean;
}

interface BirthDataContextValue extends BirthData {
  loading: boolean;
  refresh: () => Promise<void>;
  save: (patch: Partial<BirthData>) => Promise<void>;
}

const empty: BirthData = {
  name: null,
  dateOfBirth: null,
  timeOfBirth: null,
  placeOfBirth: null,
  onboardingComplete: false,
};

const BirthDataContext = createContext<BirthDataContextValue | null>(null);

export function BirthDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [data, setData] = useState<BirthData>(empty);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) {
      setData(empty);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: row } = await supabase
      .from('profiles')
      .select('name, date_of_birth, time_of_birth, place_of_birth, onboarding_complete')
      .eq('id', user.id)
      .single();
    setData({
      name: row?.name ?? null,
      dateOfBirth: row?.date_of_birth ?? null,
      timeOfBirth: row?.time_of_birth ?? null,
      placeOfBirth: row?.place_of_birth ?? null,
      onboardingComplete: !!row?.onboarding_complete,
    });
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [user?.id]);

  const save = async (patch: Partial<BirthData>) => {
    if (!user) return;
    const dbPatch: Record<string, any> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.dateOfBirth !== undefined) dbPatch.date_of_birth = patch.dateOfBirth;
    if (patch.timeOfBirth !== undefined) dbPatch.time_of_birth = patch.timeOfBirth;
    if (patch.placeOfBirth !== undefined) dbPatch.place_of_birth = patch.placeOfBirth;
    if (patch.onboardingComplete !== undefined)
      dbPatch.onboarding_complete = patch.onboardingComplete;

    setData((prev) => ({ ...prev, ...patch }));
    await supabase.from('profiles').update(dbPatch).eq('id', user.id);
  };

  return (
    <BirthDataContext.Provider value={{ ...data, loading, refresh, save }}>
      {children}
    </BirthDataContext.Provider>
  );
}

export function useBirthData() {
  const ctx = useContext(BirthDataContext);
  if (!ctx) throw new Error('useBirthData must be used within <BirthDataProvider>');
  return ctx;
}
