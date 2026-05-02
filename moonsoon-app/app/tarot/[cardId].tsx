import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Fonts } from '@/constants/fonts';

const CARDS: Record<
  string,
  {
    numeral: string;
    name: string;
    keywords: string;
    reading: string;
    astrology: string;
    about: string;
  }
> = {
  'the-moon': {
    numeral: 'XVIII',
    name: 'The Moon',
    keywords: 'Intuition · Illusion · Subconscious',
    reading:
      'You are being asked to walk a path that is not fully lit, and to keep walking anyway. The Moon does not promise clarity — she promises that what is hidden will keep returning until you turn and look.\n\nNotice what your body is telling you. Notice what you are pretending not to notice. Trust the dream you keep having; the symbol is doing real work.\n\nThis is not a card of certainty. It is a card of becoming someone who can move through uncertainty without losing themselves.',
    astrology:
      'The Moon is associated with Pisces and the watery edges of the chart. Today’s alignment activates your imaginative house and softens your boundaries — keep good company.',
    about:
      'Eighteenth in the Major Arcana. Two pillars frame a moonlit road; a wolf and a dog howl at the sky while a small creature crawls from the depths. The lesson is initiation through what cannot be fully seen.',
  },
  'the-star': {
    numeral: 'XVII',
    name: 'The Star',
    keywords: 'Hope · Renewal · Quiet faith',
    reading:
      'After a long stretch of holding tension, something in you is allowed to let go. The Star is the soft exhale that comes after the storm has finished its work.\n\nYou do not have to perform recovery. You can simply rest in the knowledge that what was hardest has already passed.',
    astrology: 'Linked to Aquarius — community, vision, the long view of your own life.',
    about:
      'A figure kneels by water, pouring from two vessels into the earth and the river. Above her, a single bright star anchors a constellation of seven smaller ones.',
  },
  'the-empress': {
    numeral: 'III',
    name: 'The Empress',
    keywords: 'Abundance · Care · Earned softness',
    reading:
      'You are being invited to receive. Not to earn. Not to deserve. To receive. Notice where you are still translating love into a transaction.',
    astrology: 'Ruled by Venus — pleasure, art, the body’s wisdom.',
    about: 'A seated figure in a wheat field, crowned with stars, surrounded by ripening fruit.',
  },
  'the-tower': {
    numeral: 'XVI',
    name: 'The Tower',
    keywords: 'Rupture · Truth · Necessary collapse',
    reading:
      'Something built on a fault line is coming apart so something more honest can be built. This is uncomfortable. It is also a kind of mercy.',
    astrology: 'Mars — the planet of friction and forward motion.',
    about: 'Lightning strikes a tall tower; figures fall from the windows. The crown is dislodged.',
  },
};

export default function TarotRevealed() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const { palette, accent } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const card = CARDS[cardId as string] ?? CARDS['the-moon'];

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

      {/* Card */}
      <View
        style={{
          width: 200,
          height: 300,
          backgroundColor: accent,
          alignSelf: 'center',
          padding: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
        }}>
        <Text style={{ fontSize: 11, color: '#FFFFFF', letterSpacing: 1.5 }}>{card.numeral}</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderWidth: 0.5,
              borderColor: '#FFFFFF',
              borderRadius: 30,
              position: 'absolute',
            }}
          />
          <View
            style={{
              width: 36,
              height: 36,
              borderWidth: 0.5,
              borderColor: '#FFFFFF',
              borderRadius: 18,
            }}
          />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: Fonts.heading,
              fontSize: 24,
              color: '#FFFFFF',
              marginBottom: 6,
            }}>
            {card.name}
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
            {card.keywords}
          </Text>
        </View>
      </View>

      <Divider />
      <Caption>Your reading</Caption>
      <Text
        style={{
          fontSize: 15,
          lineHeight: 24,
          color: palette.textPrimary,
          marginTop: 16,
        }}>
        {card.reading}
      </Text>

      <Divider />
      <Caption>Astrological context</Caption>
      <Text
        style={{
          fontSize: 15,
          lineHeight: 24,
          color: palette.textPrimary,
          marginTop: 16,
        }}>
        {card.astrology}
      </Text>

      <Divider />
      <Caption>About this card</Caption>
      <Text
        style={{
          fontSize: 15,
          lineHeight: 24,
          color: palette.textPrimary,
          marginTop: 16,
        }}>
        {card.about}
      </Text>

      <View style={{ alignItems: 'flex-end', marginTop: 32 }}>
        <Pressable>
          <Text style={{ fontSize: 15, color: accent }}>Share reading</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
