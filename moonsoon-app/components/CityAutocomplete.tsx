import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';

export interface CitySelection {
  label: string; // "Paris, France"
  lat: number;
  lng: number;
}

interface GeoResult {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

// Free, keyless geocoding. Must never block input: plain typed text stays valid
// even when the network is down or the API rate-limits.
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export function CityAutocomplete({
  value,
  onChangeText,
  onSelect,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (city: CitySelection) => void;
}) {
  const { t, i18n } = useTranslation();
  const { palette } = useTheme();
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  const search = (text: string) => {
    onChangeText(text);
    if (debounce.current) clearTimeout(debounce.current);
    if (text.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounce.current = setTimeout(async () => {
      try {
        const url = `${GEO_URL}?name=${encodeURIComponent(text.trim())}&count=5&language=${i18n.language}&format=json`;
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        setResults((json.results as GeoResult[]) ?? []);
        setOpen(true);
      } catch {
        // Offline / API error → keep free-text input working, no suggestions.
      }
    }, 300);
  };

  const pick = (r: GeoResult) => {
    const label = [r.name, r.country].filter(Boolean).join(', ');
    onChangeText(label);
    setOpen(false);
    setResults([]);
    onSelect({ label, lat: r.latitude, lng: r.longitude });
  };

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={search}
        placeholder={t('onboarding.placePlaceholder')}
        placeholderTextColor={palette.textTertiary}
        style={{
          height: 48,
          borderWidth: 1,
          borderColor: palette.border,
          backgroundColor: palette.surface,
          paddingHorizontal: 12,
          fontSize: 15,
          color: palette.textPrimary,
        }}
      />
      {open && results.length > 0 && (
        <View
          style={{
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: palette.border,
            backgroundColor: palette.surface,
          }}>
          {results.map((r, i) => (
            <Pressable
              key={r.id}
              onPress={() => pick(r)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderTopWidth: i > 0 ? 0.5 : 0,
                borderTopColor: palette.border,
              }}>
              <Text style={{ fontSize: 15, color: palette.textPrimary }}>
                {[r.name, r.admin1, r.country].filter(Boolean).join(', ')}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
