import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useSeed } from '@/context/SeedContext';
import { useBirthData } from '@/context/BirthDataContext';
import { useSession } from '@/context/AuthContext';
import { drawCards, getCardById, type DrawnCard } from '@/utils/tarot';
import {
  ASPECTS_POOL,
  MANTRAS_POOL,
  getDailyHoroscopeParams,
  sunSignFromDate,
} from '@/utils/horoscope';
import { Fonts } from '@/constants/fonts';

const MAX_MESSAGES = 30;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function CardMiniature({
  card,
  border,
  surface,
  textPrimary,
  textTertiary,
}: {
  card: DrawnCard;
  border: string;
  surface: string;
  textPrimary: string;
  textTertiary: string;
}) {
  return (
    <View
      style={{
        width: 60,
        height: 90,
        borderWidth: 0.5,
        borderColor: border,
        backgroundColor: surface,
        padding: 6,
        marginRight: 8,
        opacity: card.reversed ? 0.55 : 1,
        transform: [{ rotate: card.reversed ? '180deg' : '0deg' }],
      }}>
      <Text
        style={{
          fontSize: 9,
          color: card.reversed ? textTertiary : textPrimary,
          fontWeight: '500',
        }}
        numberOfLines={2}>
        {card.name}
      </Text>
    </View>
  );
}

function TypingDot({ index, color }: { index: number; color: string }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    // Sequential fade: each dot pulses on an ~800ms loop, staggered by 150ms.
    opacity.value = withDelay(
      index * 150,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 250 }),
          withTiming(0.3, { duration: 250 }),
          withTiming(0.3, { duration: 300 })
        ),
        -1
      )
    );
  }, [index, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width: 4, height: 4, backgroundColor: color, marginRight: 4 }, style]}
    />
  );
}

function TypingIndicator({ color }: { color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
      {[0, 1, 2].map((i) => (
        <TypingDot key={i} index={i} color={color} />
      ))}
    </View>
  );
}

export default function TarotChat() {
  const params = useLocalSearchParams<{ ids?: string; reversed?: string }>();
  const { palette, accent } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { seed } = useSeed();
  const { dateOfBirth } = useBirthData();
  const { session } = useSession();
  const scrollRef = useRef<ScrollView>(null);

  // Reconstruct the 3-card draw — prefer params, fall back to today's seeded draw
  const drawn = useMemo<DrawnCard[]>(() => {
    if (params.ids) {
      const ids = params.ids.split(',');
      const reversedFlags = (params.reversed ?? '').split(',');
      const cards = ids
        .map((id, i) => {
          const c = getCardById(id);
          if (!c) return null;
          return { ...c, reversed: reversedFlags[i] === '1' };
        })
        .filter((x): x is DrawnCard => x !== null);
      if (cards.length) return cards;
    }
    return seed != null ? drawCards(seed, 3) : [];
  }, [params.ids, params.reversed, seed]);

  const astro = useMemo(() => {
    if (seed == null) return { sunSign: undefined, aspect: undefined, mantra: undefined };
    const sun = sunSignFromDate(dateOfBirth);
    const p = getDailyHoroscopeParams(seed, sun);
    return {
      sunSign: sun,
      aspect: ASPECTS_POOL[p.aspectIndex],
      mantra: MANTRAS_POOL[p.mantraIndex],
    };
  }, [seed, dateOfBirth]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);
  const userCount = messages.filter((m) => m.role === 'user').length;
  const limitReached = userCount >= MAX_MESSAGES;

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [messages.length]);

  const send = async () => {
    const content = draft.trim();
    if (!content || streaming || limitReached || !session) return;

    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setDraft('');
    setStreaming(true);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const fnUrl =
        process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL ||
        `${process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''}/functions/v1`;
      const res = await fetch(`${fnUrl}/tarot-chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: next,
          drawnCards: drawn.map((c) => ({
            id: c.id,
            name: c.name,
            reversed: c.reversed,
            keywords: c.reversed ? c.keywordsReversed : c.keywords,
          })),
          astroContext: astro,
          lang: i18next.language,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Chat request failed: ${res.status}`);
      }

      const reader = (res.body as any).getReader?.();
      if (!reader) {
        // Fallback for environments without streaming — read full body.
        const text = await res.text();
        const fullDelta = parseSSEFull(text);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: fullDelta };
          return copy;
        });
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let assistant = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';
        for (const evt of events) {
          const line = evt.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              const snapshot = assistant;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: 'assistant', content: snapshot };
                return copy;
              });
            }
          } catch {
            // ignore malformed chunk
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: 'assistant',
          content:
            i18next.language === 'fr'
              ? 'Désolé, une erreur est survenue. Réessaie dans un instant.'
              : 'Sorry, something went wrong. Please try again in a moment.',
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 32,
          borderBottomWidth: 0.5,
          borderBottomColor: palette.border,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Text style={{ fontSize: 15, color: palette.textPrimary }}>‹ {t('common.back')}</Text>
          </Pressable>
          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.headingSemi,
              fontSize: 18,
              color: palette.textPrimary,
            }}>
            {t('chat.title')}
          </Text>
          <Text style={{ fontSize: 11, color: palette.textTertiary }}>
            {t('chat.messageCount', { count: userCount, max: MAX_MESSAGES })}
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          {drawn.map((c) => (
            <CardMiniature
              key={c.id}
              card={c}
              border={palette.border}
              surface={palette.surface}
              textPrimary={palette.textPrimary}
              textTertiary={palette.textTertiary}
            />
          ))}
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 32, paddingVertical: 24 }}>
        {messages.map((m, i) => (
          <View
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              backgroundColor: m.role === 'user' ? `${accent}1F` /* ~12% */ : palette.surface,
              padding: 12,
              paddingHorizontal: 16,
              marginBottom: 12,
            }}>
            {m.content === '' && streaming && i === messages.length - 1 ? (
              <TypingIndicator color={palette.textSecondary} />
            ) : (
              <Text style={{ fontSize: 15, lineHeight: 22, color: palette.textPrimary }}>
                {m.content}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      {limitReached ? (
        <View
          style={{
            padding: 16,
            paddingBottom: insets.bottom + 16,
            backgroundColor: palette.surface,
            borderTopWidth: 0.5,
            borderTopColor: palette.border,
          }}>
          <Text style={{ fontSize: 13, color: palette.textSecondary, textAlign: 'center' }}>
            {t('chat.limitReached')}
          </Text>
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 12,
            borderTopWidth: 0.5,
            borderTopColor: palette.border,
            backgroundColor: palette.background,
            alignItems: 'flex-end',
          }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            editable={!streaming}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={palette.textTertiary}
            multiline
            style={{
              flex: 1,
              minHeight: 40,
              maxHeight: 120,
              borderWidth: 0.5,
              borderColor: palette.border,
              backgroundColor: palette.surface,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 15,
              color: palette.textPrimary,
              marginRight: 12,
            }}
          />
          <Pressable
            onPress={send}
            disabled={streaming || draft.trim().length === 0}
            style={{
              backgroundColor: accent,
              paddingHorizontal: 16,
              minHeight: 40,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: streaming || draft.trim().length === 0 ? 0.5 : 1,
            }}>
            {streaming ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                {t('chat.send')}
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// Used only when the platform fetch returns a fully buffered SSE response.
function parseSSEFull(text: string): string {
  let acc = '';
  for (const evt of text.split('\n\n')) {
    const line = evt.trim();
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (payload === '[DONE]') continue;
    try {
      const json = JSON.parse(payload);
      const delta = json.choices?.[0]?.delta?.content;
      if (delta) acc += delta;
    } catch {
      // ignore
    }
  }
  return acc;
}
