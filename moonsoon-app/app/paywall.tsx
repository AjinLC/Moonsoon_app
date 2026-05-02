import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Fonts } from '@/constants/fonts';

const FEATURES = [
  {
    title: 'Personalized full-length readings',
    desc: 'Daily horoscopes that pull directly from your chart, not from a generic sun-sign feed.',
  },
  {
    title: 'Unlimited tarot draws',
    desc: 'Pull more than once a day. Save and revisit any reading.',
  },
  {
    title: 'Yearly forecast',
    desc: 'A long-form look at the transits shaping the next twelve months of your life.',
  },
  {
    title: 'Private journaling',
    desc: 'Lock entries with your device passcode and link them to readings and tarot draws.',
  },
];

const TEASER =
  'Mercury sharpens your thinking and softens your speech, making this an unusually good day for the conversations you have been putting off. The Moon in Cancer asks you to lead with care. Trust the slow movements; nothing today rewards the rush. ' +
  'A small honesty becomes a doorway. Speak the soft thing you almost kept to yourself.';

export default function Paywall() {
  const { palette, accent, mode } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tier, setTier] = useState<'monthly' | 'yearly'>('yearly');

  const Caption = ({ children, center }: { children: string; center?: boolean }) => (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: palette.textTertiary,
        textAlign: center ? 'center' : 'left',
      }}>
      {children}
    </Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 32,
        }}>
        <View style={{ alignItems: 'flex-end', marginBottom: 24 }}>
          <Pressable onPress={() => router.back()}>
            <Text style={{ fontSize: 18, color: palette.textPrimary }}>×</Text>
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Caption center>Premium</Caption>
          <Text
            style={{
              fontFamily: Fonts.display,
              fontSize: 32,
              lineHeight: 38,
              color: palette.textPrimary,
              textAlign: 'center',
              marginTop: 16,
              marginBottom: 12,
            }}>
            Unlock your full alignment.
          </Text>
          <Text
            style={{
              fontSize: 15,
              lineHeight: 22,
              color: palette.textSecondary,
              textAlign: 'center',
            }}>
            Deeper readings, unlimited tarot, and the long view of your year.
          </Text>
        </View>

        <View style={{ height: 0.5, backgroundColor: palette.border, marginBottom: 24 }} />

        {/* Frosted teaser */}
        <View style={{ position: 'relative', marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 15,
              lineHeight: 24,
              color: palette.textPrimary,
            }}>
            {TEASER}
          </Text>
          <BlurView
            intensity={28}
            tint={mode === 'dark' ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </View>

        <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 24 }} />

        <Text
          style={{
            fontFamily: Fonts.headingSemi,
            fontSize: 18,
            color: palette.textPrimary,
            marginBottom: 16,
          }}>
          What you get
        </Text>
        {FEATURES.map((f) => (
          <View key={f.title} style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '500',
                color: palette.textPrimary,
                marginBottom: 4,
              }}>
              — {f.title}
            </Text>
            <Text
              style={{
                fontSize: 13,
                lineHeight: 20,
                color: palette.textTertiary,
                marginLeft: 20,
              }}>
              {f.desc}
            </Text>
          </View>
        ))}

        <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 24 }} />

        {/* Pricing tiles */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          {(
            [
              { id: 'monthly', label: 'Monthly', price: '$4.99 / month', tag: '' },
              {
                id: 'yearly',
                label: 'Yearly — save 40%',
                price: '$2.99 / month',
                tag: 'Best value',
              },
            ] as const
          ).map((p) => {
            const on = tier === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setTier(p.id)}
                style={{
                  width: '48%',
                  height: 76,
                  borderWidth: 1,
                  borderColor: on ? accent : palette.border,
                  paddingHorizontal: 12,
                  justifyContent: 'center',
                }}>
                <Text style={{ fontSize: 13, color: palette.textPrimary }}>{p.label}</Text>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '500',
                    color: palette.textPrimary,
                    marginTop: 6,
                  }}>
                  {p.price}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={{
            height: 48,
            backgroundColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
            Start free trial
          </Text>
        </Pressable>
        <Text
          style={{
            fontSize: 11,
            color: palette.textTertiary,
            textAlign: 'center',
            marginTop: 12,
          }}>
          7-day free trial, cancel anytime
        </Text>
      </ScrollView>
    </View>
  );
}
