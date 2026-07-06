import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useSession } from './AuthContext';

export type HoroscopeDetailLevel = 'brief' | 'standard';

export interface Preferences {
  notificationsMantra: boolean;
  notificationsHoroscope: boolean;
  horoscopeDetailLevel: HoroscopeDetailLevel;
}

interface PreferencesContextValue extends Preferences {
  save: (patch: Partial<Preferences>) => Promise<void>;
}

const defaults: Preferences = {
  notificationsMantra: true,
  notificationsHoroscope: true,
  horoscopeDetailLevel: 'standard',
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [prefs, setPrefs] = useState<Preferences>(defaults);

  useEffect(() => {
    if (!user) {
      setPrefs(defaults);
      return;
    }
    let cancelled = false;
    (async () => {
      let { data } = await supabase
        .from('profiles')
        .select('notifications_mantra, notifications_horoscope, horoscope_detail_level')
        .eq('id', user.id)
        .single();
      if (!data) {
        // Fallback for a DB where migration_003 (horoscope_detail_level) has not run yet.
        const legacy = await supabase
          .from('profiles')
          .select('notifications_mantra, notifications_horoscope')
          .eq('id', user.id)
          .single();
        data = legacy.data as typeof data;
      }
      if (cancelled || !data) return;
      setPrefs({
        notificationsMantra: data.notifications_mantra ?? true,
        notificationsHoroscope: data.notifications_horoscope ?? true,
        horoscopeDetailLevel:
          (data as Record<string, unknown>).horoscope_detail_level === 'brief'
            ? 'brief'
            : 'standard',
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const save = async (patch: Partial<Preferences>) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
    if (!user) return;
    const dbPatch: Record<string, unknown> = {};
    if (patch.notificationsMantra !== undefined)
      dbPatch.notifications_mantra = patch.notificationsMantra;
    if (patch.notificationsHoroscope !== undefined)
      dbPatch.notifications_horoscope = patch.notificationsHoroscope;
    if (patch.horoscopeDetailLevel !== undefined)
      dbPatch.horoscope_detail_level = patch.horoscopeDetailLevel;
    await supabase.from('profiles').update(dbPatch).eq('id', user.id);
  };

  return (
    <PreferencesContext.Provider value={{ ...prefs, save }}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within <PreferencesProvider>');
  return ctx;
}
