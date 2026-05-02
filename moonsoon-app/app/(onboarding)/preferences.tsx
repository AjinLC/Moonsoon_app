import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useBirthData } from '@/context/BirthDataContext';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/context/AuthContext';
import { Fonts } from '@/constants/fonts';

const FOCUS_AREAS = [
  'Health & Wellness',
  'Career & Finance',
  'Spiritual Growth',
  'Love & Relationships',
  'Creativity',
  'Learning',
];

function Toggle({ on, onChange, accent, border }: { on: boolean; onChange: () => void; accent: string; border: string }) {
  return (
    <Pressable
      onPress={onChange}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        backgroundColor: on ? accent : border,
        padding: 2,
        alignItems: on ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
      }}>
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: '#FFFFFF',
        }}
      />
    </Pressable>
  );
}

export default function Preferences() {
  const { palette, accent } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { save } = useBirthData();
  const { user } = useSession();

  const [focus, setFocus] = useState<string[]>([]);
  const [mantraOn, setMantraOn] = useState(true);
  const [horoscopeOn, setHoroscopeOn] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleFocus = (item: string) =>
    setFocus((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );

  const finish = async () => {
    setSaving(true);
    if (user) {
      await supabase
        .from('profiles')
        .update({
          focus_areas: focus,
          notifications_mantra: mantraOn,
          notifications_horoscope: horoscopeOn,
        })
        .eq('id', user.id);
    }
    await save({ onboardingComplete: true });
    setSaving(false);
    router.replace('/(tabs)');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 32,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 32,
      }}>
      <Text
        style={{
          fontFamily: Fonts.display,
          fontSize: 32,
          lineHeight: 38,
          color: palette.textPrimary,
          marginBottom: 12,
        }}>
        Where would you like to focus?
      </Text>
      <Text
        style={{
          fontSize: 15,
          lineHeight: 22,
          color: palette.textSecondary,
          marginBottom: 32,
        }}>
        Pick any number — your readings will pay closer attention to these areas.
      </Text>

      {/* Focus areas grid */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 32,
        }}>
        {FOCUS_AREAS.map((item) => {
          const selected = focus.includes(item);
          return (
            <Pressable
              key={item}
              onPress={() => toggleFocus(item)}
              style={{
                width: '48%',
                height: 56,
                borderWidth: 1,
                borderColor: selected ? accent : palette.border,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  color: selected ? accent : palette.textPrimary,
                  textAlign: 'center',
                  paddingHorizontal: 8,
                }}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Notifications */}
      <Text
        style={{
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: palette.textTertiary,
          marginBottom: 16,
        }}>
        Notifications
      </Text>

      {[
        {
          label: 'Daily mantra reminders',
          desc: 'A short prompt at sunrise to set the tone of your day.',
          value: mantraOn,
          set: setMantraOn,
        },
        {
          label: 'Horoscope updates',
          desc: 'A nudge when your daily reading is ready.',
          value: horoscopeOn,
          set: setHoroscopeOn,
        },
      ].map((row, i) => (
        <View key={row.label}>
          {i > 0 && (
            <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 16 }} />
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ fontSize: 15, color: palette.textPrimary, marginBottom: 4 }}>
                {row.label}
              </Text>
              <Text style={{ fontSize: 13, color: palette.textTertiary, lineHeight: 18 }}>
                {row.desc}
              </Text>
            </View>
            <Toggle
              on={row.value}
              onChange={() => row.set(!row.value)}
              accent={accent}
              border={palette.border}
            />
          </View>
        </View>
      ))}

      <Pressable
        onPress={finish}
        disabled={saving}
        style={{
          height: 48,
          backgroundColor: accent,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 48,
          opacity: saving ? 0.6 : 1,
        }}>
        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Get started</Text>
      </Pressable>
    </ScrollView>
  );
}
