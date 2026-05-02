export const LightTheme = {
  background: '#F7F7F7',
  surface: '#F8F8F8',
  border: '#E5E5E5',
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
} as const;

export const DarkTheme = {
  background: '#0A0A0A',
  surface: '#141414',
  border: '#2A2A2A',
  textPrimary: '#FFFFFF',
  textSecondary: '#999999',
  textTertiary: '#666666',
} as const;

export type ThemeMode = 'light' | 'dark';
export interface ThemePalette {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
}

export const Accents = {
  indigo: '#4F46E5',
  sage: '#6B8F71',
  rose: '#C4727F',
  amber: '#D4A843',
} as const;

export type AccentName = keyof typeof Accents;

export const getPalette = (mode: ThemeMode): ThemePalette =>
  mode === 'dark' ? DarkTheme : LightTheme;
