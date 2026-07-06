import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Accents, AccentName, ThemeMode, ThemePalette, getPalette } from '@/constants/theme';
import { supabase } from '@/utils/supabase';
import { useSession } from './AuthContext';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode; // legacy alias for effectiveMode (kept for older call sites)
  effectiveMode: ThemeMode;
  themePreference: ThemePreference;
  palette: ThemePalette;
  accentName: AccentName;
  accent: string;
  setMode: (m: ThemeMode) => Promise<void>; // legacy: maps to setThemePreference
  setThemePreference: (pref: ThemePreference) => Promise<void>;
  setAccent: (a: AccentName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null, updates live
  const [themePreference, setPrefState] = useState<ThemePreference>('system');
  const [accentName, setAccentState] = useState<AccentName>('indigo');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('theme, theme_preference, accent_color')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (cancelled || !data) return;
        const pref = data.theme_preference;
        if (pref === 'system' || pref === 'light' || pref === 'dark') {
          setPrefState(pref);
        } else if (data.theme === 'light' || data.theme === 'dark') {
          // Legacy fallback before migration_002 has been applied
          setPrefState(data.theme);
        }
        if (data.accent_color && data.accent_color in Accents) {
          setAccentState(data.accent_color as AccentName);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const effectiveMode: ThemeMode =
    themePreference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePreference;

  const setThemePreference = async (pref: ThemePreference) => {
    setPrefState(pref);
    if (user) {
      await supabase
        .from('profiles')
        .update({
          theme_preference: pref,
          // also keep legacy `theme` in sync with the resolved value
          theme: pref === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : pref,
        })
        .eq('id', user.id);
    }
  };

  const setMode = (m: ThemeMode) => setThemePreference(m);

  const setAccent = async (a: AccentName) => {
    setAccentState(a);
    if (user) await supabase.from('profiles').update({ accent_color: a }).eq('id', user.id);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode: effectiveMode,
      effectiveMode,
      themePreference,
      palette: getPalette(effectiveMode),
      accentName,
      accent: Accents[accentName],
      setMode,
      setThemePreference,
      setAccent,
    }),
    [effectiveMode, themePreference, accentName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
