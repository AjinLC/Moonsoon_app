import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Fonts } from '@/constants/fonts';

const today = new Date();
const dateLabel = today.toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

const READINGS: Record<
  string,
  {
    title: string;
    body: string[];
    aspects: { name: string; body: string }[];
    mantra: string;
  }
> = {
  love: {
    title: 'Love',
    body: [
      'A small honesty becomes a doorway today. The aspect between Venus and your Moon makes the things you usually round off — the small disappointments, the quiet hopes — easier to name out loud. The conversation you have been writing in your head is ready to be said.',
      'Notice what arrives uninvited: a memory, a name, a softening. Let it stay long enough to tell you what it wants. Love is rarely loud today. It is precise.',
    ],
    aspects: [
      {
        name: 'Venus trine Moon',
        body: 'A flowing aspect between the planet of relating and the planet of feeling. The result is unusual permeability — what you feel, you can also describe; what you describe, the other person can actually receive.',
      },
      {
        name: 'Mercury sextile Neptune',
        body: 'Words become a little more dreamlike, a little more honest. Useful for letters, for the difficult thank-you, for the quiet sentence that shifts the whole weather of the room.',
      },
    ],
    mantra: 'I let the truth I am ready to speak shape the room I am in.',
  },
  friends: {
    title: 'Friends',
    body: [
      'Old loyalties resurface. A friend you have not held closely in months returns to the front of your mind for a reason. Send the message. Make it short.',
      'Today rewards the friendship that was built on noticing — the kind that does not need a big occasion to be picked back up.',
    ],
    aspects: [
      {
        name: 'Sun in your 11th house',
        body: 'The 11th is the room of friendship and chosen family. The sun warms it today; you are easier to find, and so are they.',
      },
    ],
    mantra: 'I keep the door open even on the days I do not knock.',
  },
  family: {
    title: 'Family',
    body: [
      'A reminder of where you come from arrives gently today. It does not need to become a verdict. It can simply be information.',
    ],
    aspects: [
      {
        name: 'Moon in Cancer',
        body: 'Cancer is the sign of home and inheritance. The moon’s passage stirs old water — let it settle before you decide what it means.',
      },
    ],
    mantra: 'I receive my history without rewriting myself in its image.',
  },
  career: {
    title: 'Career',
    body: [
      'You can see two moves ahead. Trust the long game and decline the urgency that does not belong to you. The ambitious thing today is the patient thing.',
    ],
    aspects: [
      {
        name: 'Saturn sextile Sun',
        body: 'Saturn rewards effort that compounds. A small, unglamorous task today is doing more for your ten-year arc than any heroic gesture would.',
      },
    ],
    mantra: 'I build at the pace of what I want to last.',
  },
};

export default function HoroscopeDetail() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { palette } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const reading = READINGS[(category as string)?.toLowerCase()] ?? READINGS.love;

  const Caption = ({ children }: { children: string }) => (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: palette.textTertiary,
      }}>
      {children}
    </Text>
  );

  const Divider = () => (
    <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 28 }} />
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: 64,
        paddingHorizontal: 32,
      }}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 15, color: palette.textPrimary }}>‹ Back</Text>
      </Pressable>

      <Text
        style={{
          fontFamily: Fonts.display,
          fontSize: 32,
          color: palette.textPrimary,
          marginBottom: 12,
        }}>
        {reading.title}
      </Text>
      <Caption>{dateLabel}</Caption>

      <Divider />

      {reading.body.map((p, i) => (
        <Text
          key={i}
          style={{
            fontSize: 15,
            lineHeight: 24,
            color: palette.textPrimary,
            marginBottom: i < reading.body.length - 1 ? 16 : 0,
          }}>
          {p}
        </Text>
      ))}

      <Divider />

      <Caption>Where this comes from</Caption>
      <Text
        style={{
          fontSize: 13,
          lineHeight: 20,
          color: palette.textSecondary,
          marginTop: 16,
          marginBottom: 24,
        }}>
        Each reading is grounded in the day’s major aspects. Here are the ones doing most of the work
        today.
      </Text>

      {reading.aspects.map((a, i) => (
        <View key={a.name}>
          {i > 0 && (
            <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 24 }} />
          )}
          <Text
            style={{
              fontFamily: Fonts.headingSemi,
              fontSize: 18,
              color: palette.textPrimary,
              marginBottom: 12,
            }}>
            {a.name}
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 24, color: palette.textPrimary }}>
            {a.body}
          </Text>
        </View>
      ))}

      <Divider />
      <Caption>Linked mantra</Caption>
      <Text
        style={{
          fontFamily: Fonts.heading,
          fontSize: 24,
          lineHeight: 32,
          color: palette.textPrimary,
          marginTop: 16,
        }}>
        “{reading.mantra}”
      </Text>
    </ScrollView>
  );
}
