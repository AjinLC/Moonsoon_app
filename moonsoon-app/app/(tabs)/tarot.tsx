import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Fonts } from '@/constants/fonts';

const RECENT = [
  {
    id: 'the-star',
    name: 'The Star',
    keywords: 'Hope · Renewal · Quiet faith',
    date: 'Yesterday',
  },
  {
    id: 'the-empress',
    name: 'The Empress',
    keywords: 'Abundance · Care · Earned softness',
    date: 'Mar 16',
  },
  {
    id: 'the-tower',
    name: 'The Tower',
    keywords: 'Rupture · Truth · Necessary collapse',
    date: 'Mar 14',
  },
];

const TODAYS_CARD_ID = 'the-moon';

export default function TarotPreReveal() {
  const { palette } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${rotation.value}deg` }],
  }));

  const goToReveal = () => {
    router.push(`/tarot/${TODAYS_CARD_ID}` as never);
  };

  const flip = () => {
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
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 32,
        paddingBottom: 64,
        paddingHorizontal: 32,
      }}>
      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
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
              animatedStyle,
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
        <Text
          style={{
            fontFamily: Fonts.headingSemi,
            fontSize: 18,
            color: palette.textSecondary,
            marginTop: 32,
          }}>
          Draw today’s card
        </Text>
      </View>

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 24 }} />

      <Text
        style={{
          fontFamily: Fonts.headingSemi,
          fontSize: 18,
          color: palette.textPrimary,
          marginBottom: 4,
        }}>
        Recent readings
      </Text>
      <Text style={{ fontSize: 13, color: palette.textTertiary, marginBottom: 16 }}>
        Your past draws and what they revealed.
      </Text>

      {RECENT.map((r, i) => (
        <View key={r.id}>
          {i > 0 && <View style={{ height: 0.5, backgroundColor: palette.border }} />}
          <Pressable
            onPress={() => router.push(`/tarot/${r.id}` as never)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
            }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: palette.textPrimary }}>{r.name}</Text>
              <Text
                style={{
                  fontSize: 13,
                  color: palette.textTertiary,
                  marginTop: 4,
                }}>
                {r.keywords}
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: palette.textTertiary, marginRight: 12 }}>
              {r.date}
            </Text>
            <Text style={{ fontSize: 18, color: palette.textTertiary }}>›</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
