import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { Fonts } from '@/constants/fonts';
import { getCardById, TarotCard } from '@/utils/tarot';

const FALLBACK: TarotCard = {
  id: 'major-18',
  name: 'The Moon',
  arcana: 'major',
  keywords: ['Intuition', 'Illusion', 'Subconscious'],
  keywordsReversed: ['Confusion released', 'Truth', 'Clarity'],
  description: 'Walk a path that is not fully lit, and keep walking.',
};

const READINGS: Record<
  string,
  { reading: string; astrology: string; about: string; numeral?: string }
> = {
  'major-18': {
    numeral: 'XVIII',
    reading:
      'You are being asked to walk a path that is not fully lit, and to keep walking anyway. The Moon does not promise clarity — she promises that what is hidden will keep returning until you turn and look.\n\nNotice what your body is telling you. Notice what you are pretending not to notice. Trust the dream you keep having; the symbol is doing real work.',
    astrology:
      'Linked to Pisces — the watery edges of the chart, the imaginative house softened today.',
    about:
      'Two pillars frame a moonlit road; a wolf and a dog howl at the sky while a small creature crawls from the depths. Initiation through what cannot be fully seen.',
  },
  'major-17': {
    numeral: 'XVII',
    reading:
      'After a long stretch of holding tension, something in you is allowed to let go. The Star is the soft exhale that comes after the storm has finished its work.',
    astrology: 'Linked to Aquarius — community, vision, the long view of your own life.',
    about:
      'A figure kneels by water, pouring from two vessels. A single bright star anchors a constellation.',
  },
  'major-03': {
    numeral: 'III',
    reading:
      'You are being invited to receive. Not to earn. Not to deserve. To receive. Notice where you are still translating love into a transaction.',
    astrology: 'Ruled by Venus — pleasure, art, the body’s wisdom.',
    about: 'A seated figure in a wheat field, crowned with stars, surrounded by ripening fruit.',
  },
  'major-16': {
    numeral: 'XVI',
    reading:
      'Something built on a fault line is coming apart so something more honest can be built. This is uncomfortable. It is also a kind of mercy.',
    astrology: 'Mars — the planet of friction and forward motion.',
    about: 'Lightning strikes a tall tower; figures fall from the windows. The crown is dislodged.',
  },
};

function deriveNumeral(card: TarotCard): string {
  if (card.arcana === 'major') {
    const num = parseInt(card.id.split('-')[1], 10);
    const ROMAN = [
      '0',
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
      'XI',
      'XII',
      'XIII',
      'XIV',
      'XV',
      'XVI',
      'XVII',
      'XVIII',
      'XIX',
      'XX',
      'XXI',
    ];
    return ROMAN[num] ?? '';
  }
  return card.suit?.toUpperCase() ?? '';
}

export default function TarotRevealed() {
  const params = useLocalSearchParams<{ cardId: string; reversed?: string; ids?: string }>();
  const { t } = useTranslation();
  const { palette, accent } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const card = getCardById(params.cardId as string) ?? FALLBACK;
  const isReversed = params.reversed?.split(',')[0] === '1';
  const reading = READINGS[card.id];

  const numeral = reading?.numeral ?? deriveNumeral(card);
  const keywords = (isReversed ? card.keywordsReversed : card.keywords).join(' · ');

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

  const fallbackReading = `${card.description} ${
    isReversed ? t('tarot.readingFallbackReversed') : t('tarot.readingFallbackUpright')
  }`;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: 64,
        paddingHorizontal: 32,
      }}>
      <Pressable onPress={() => router.back()} style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 15, color: palette.textPrimary }}>‹ {t('common.back')}</Text>
      </Pressable>

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
          transform: [{ rotate: isReversed ? '180deg' : '0deg' }],
        }}>
        <Text style={{ fontSize: 11, color: '#FFFFFF', letterSpacing: 1.5 }}>{numeral}</Text>
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
              textAlign: 'center',
            }}>
            {card.name}
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
            {keywords}
          </Text>
        </View>
      </View>

      {isReversed && (
        <Text
          style={{
            fontSize: 11,
            fontWeight: '500',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: palette.textTertiary,
            textAlign: 'center',
            marginBottom: 8,
          }}>
          {t('tarot.reversed')}
        </Text>
      )}

      <Divider />
      <Caption>{t('tarot.yourReading')}</Caption>
      <Text style={{ fontSize: 15, lineHeight: 24, color: palette.textPrimary, marginTop: 16 }}>
        {reading?.reading ?? fallbackReading}
      </Text>

      <Divider />
      <Caption>{t('tarot.astroContext')}</Caption>
      <Text style={{ fontSize: 15, lineHeight: 24, color: palette.textPrimary, marginTop: 16 }}>
        {reading?.astrology ?? t('tarot.astroFallback')}
      </Text>

      <Divider />
      <Caption>{t('tarot.aboutCard')}</Caption>
      <Text style={{ fontSize: 15, lineHeight: 24, color: palette.textPrimary, marginTop: 16 }}>
        {reading?.about ?? card.description}
      </Text>

      <View style={{ alignItems: 'flex-end', marginTop: 32 }}>
        <Pressable>
          <Text style={{ fontSize: 15, color: accent }}>{t('tarot.shareReading')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
