import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Accents, AccentName, ThemeMode, ThemePalette, getPalette } from '@/constants/theme';
import { supabase } from '@/utils/supabase';
import { useSession } from './AuthContext';

interface ThemeContextValue {
  mode: ThemeMode;
  palette: ThemePalette;
  accentName: AccentName;
  accent: string;
  setMode: (m: ThemeMode) => Promise<void>;
  setAccent: (a: AccentName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [accentName, setAccentState] = useState<AccentName>('indigo');

  // Hydrate from profile when signed in
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('theme, accent_color')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.theme === 'light' || data.theme === 'dark') setModeState(data.theme);
        if (data.accent_color && data.accent_color in Accents) {
          setAccentState(data.accent_color as AccentName);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const setMode = async (m: ThemeMode) => {
    setModeState(m);
    if (user) await supabase.from('profiles').update({ theme: m }).eq('id', user.id);
  };

  const setAccent = async (a: AccentName) => {
    setAccentState(a);
    if (user) await supabase.from('profiles').update({ accent_color: a }).eq('id', user.id);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      palette: getPalette(mode),
      accentName,
      accent: Accents[accentName],
      setMode,
      setAccent,
    }),
    [mode, accentName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
