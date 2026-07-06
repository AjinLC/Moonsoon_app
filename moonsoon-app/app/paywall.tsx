import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { Fonts } from '@/constants/fonts';

const FEATURE_KEYS = ['feature1', 'feature2', 'feature3', 'feature4'] as const;

export default function Paywall() {
  const { t } = useTranslation();
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
          <Caption center>{t('paywall.premium')}</Caption>
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
            {t('paywall.headline')}
          </Text>
          <Text
            style={{
              fontSize: 15,
              lineHeight: 22,
              color: palette.textSecondary,
              textAlign: 'center',
            }}>
            {t('paywall.lead')}
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
            {t('paywall.teaser')}
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
          {t('paywall.whatYouGet')}
        </Text>
        {FEATURE_KEYS.map((key) => (
          <View key={key} style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '500',
                color: palette.textPrimary,
                marginBottom: 4,
              }}>
              — {t(`paywall.${key}Title`)}
            </Text>
            <Text
              style={{
                fontSize: 13,
                lineHeight: 20,
                color: palette.textTertiary,
                marginLeft: 20,
              }}>
              {t(`paywall.${key}Desc`)}
            </Text>
          </View>
        ))}

        <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 24 }} />

        {/* Pricing tiles */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          {(
            [
              { id: 'monthly', label: t('paywall.monthly'), price: t('paywall.monthlyPrice') },
              { id: 'yearly', label: t('paywall.yearly'), price: t('paywall.yearlyPrice') },
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
            {t('paywall.startTrial')}
          </Text>
        </Pressable>
        <Text
          style={{
            fontSize: 11,
            color: palette.textTertiary,
            textAlign: 'center',
            marginTop: 12,
          }}>
          {t('paywall.trialNote')}
        </Text>
      </ScrollView>
    </View>
  );
}
