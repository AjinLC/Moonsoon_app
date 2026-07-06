import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useSeed } from '@/context/SeedContext';
import { drawCards, getCardById } from '@/utils/tarot';
import { useTarotDraws, TarotDrawRow } from '@/hooks/useTarotDraws';
import { Fonts } from '@/constants/fonts';
import { BackgroundGlyphs } from '@/components/BackgroundGlyphs';

export default function TarotPreReveal() {
  const { palette, accent } = useTheme();
  const { seed } = useSeed();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { recent, refresh, recordDraw } = useTarotDraws();
  const rotation = useSharedValue(0);
  const chatBtn = useSharedValue(0);
  const [flipped, setFlipped] = useState(false);

  const drawn = useMemo(() => (seed != null ? drawCards(seed, 3) : null), [seed]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const dateLabel = (iso: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (iso === today) return t('common.today');
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (iso === yesterday) return t('common.yesterday');
    return new Date(`${iso}T00:00:00`).toLocaleDateString(i18n.language, {
      month: 'short',
      day: 'numeric',
    });
  };

  const openDraw = (row: TarotDrawRow) => {
    router.push({
      pathname: '/tarot/[cardId]' as never,
      params: {
        cardId: row.card_ids[0],
        ids: row.card_ids.join(','),
        reversed: row.reversed.map((r) => (r ? '1' : '0')).join(','),
      },
    } as never);
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${rotation.value}deg` }],
  }));

  const chatBtnStyle = useAnimatedStyle(() => ({
    opacity: chatBtn.value,
    transform: [{ translateY: interpolate(chatBtn.value, [0, 1], [24, 0]) }],
  }));

  const goToReveal = () => {
    if (!drawn) return;
    router.push({
      pathname: '/tarot/[cardId]' as never,
      params: {
        cardId: drawn[0].id,
        ids: drawn.map((c) => c.id).join(','),
        reversed: drawn.map((c) => (c.reversed ? '1' : '0')).join(','),
      },
    } as never);
  };

  const showChatButton = () => setFlipped(true);

  const flip = () => {
    if (!drawn) return;
    recordDraw(drawn); // fire-and-forget; unique(user_id, draw_date) dedupes
    rotation.value = withTiming(
      180,
      { duration: 400, easing: Easing.out(Easing.ease) },
      (finished) => {
        if (finished) {
          runOnJS(goToReveal)();
          rotation.value = 0;
        }
      }
    );
    runOnJS(showChatButton)();
    chatBtn.value = withDelay(420, withSpring(1, { damping: 18, stiffness: 120 }));
  };

  const goToChat = () => {
    if (!drawn) return;
    router.push({
      pathname: '/tarot/chat' as never,
      params: {
        ids: drawn.map((c) => c.id).join(','),
        reversed: drawn.map((c) => (c.reversed ? '1' : '0')).join(','),
      },
    } as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <BackgroundGlyphs variant="tarot" />
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{
          paddingTop: insets.top + 32,
          paddingBottom: 64,
          paddingHorizontal: 32,
        }}>
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          {drawn ? (
            <Pressable onPress={flip}>
              <Animated.View
                style={[
                  {
                    width: 200,
                    height: 320,
                    borderWidth: 1,
                    borderColor: palette.border,
                    backgroundColor: palette.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  cardStyle,
                ]}>
                <View
                  style={{
                    width: 172,
                    height: 292,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <View
                    style={{
                      position: 'absolute',
                      width: 0.5,
                      height: 200,
                      backgroundColor: palette.textTertiary,
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      width: 140,
                      height: 0.5,
                      backgroundColor: palette.textTertiary,
                    }}
                  />
                </View>
              </Animated.View>
            </Pressable>
          ) : (
            <View
              style={{ width: 200, height: 320, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={accent} />
            </View>
          )}
          <Text
            style={{
              fontFamily: Fonts.headingSemi,
              fontSize: 18,
              color: palette.textSecondary,
              marginTop: 32,
            }}>
            {t('tarot.drawCard')}
          </Text>

          <Animated.View
            style={[
              {
                marginTop: 24,
                display: flipped ? 'flex' : 'none',
              },
              chatBtnStyle,
            ]}>
            <Pressable
              onPress={goToChat}
              style={{
                backgroundColor: accent,
                paddingHorizontal: 24,
                paddingVertical: 14,
              }}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                {t('tarot.chatButton')}
              </Text>
            </Pressable>
          </Animated.View>
        </View>

        <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 24 }} />

        <Text
          style={{
            fontFamily: Fonts.headingSemi,
            fontSize: 18,
            color: palette.textPrimary,
            marginBottom: 4,
          }}>
          {t('tarot.recentReadings')}
        </Text>
        <Text style={{ fontSize: 13, color: palette.textTertiary, marginBottom: 16 }}>
          {t('tarot.recentReadingsLead')}
        </Text>

        {recent.length === 0 && (
          <Text style={{ fontSize: 13, color: palette.textTertiary, paddingVertical: 16 }}>
            {t('tarot.noRecent')}
          </Text>
        )}
        {recent.map((row, i) => {
          const first = getCardById(row.card_ids[0]);
          if (!first) return null;
          const firstReversed = row.reversed[0] === true;
          const keywords = (firstReversed ? first.keywordsReversed : first.keywords).join(' · ');
          return (
            <View key={row.id}>
              {i > 0 && <View style={{ height: 0.5, backgroundColor: palette.border }} />}
              <Pressable
                onPress={() => openDraw(row)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, color: palette.textPrimary }}>{first.name}</Text>
                  <Text style={{ fontSize: 13, color: palette.textTertiary, marginTop: 4 }}>
                    {keywords}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: palette.textTertiary, marginRight: 12 }}>
                  {dateLabel(row.draw_date)}
                </Text>
                <Text style={{ fontSize: 18, color: palette.textTertiary }}>›</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
