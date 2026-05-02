import '../global.css';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { AuthProvider, useSession } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { BirthDataProvider, useBirthData } from '../context/BirthDataContext';

function RootNavigator() {
  const { session, loading: authLoading } = useSession();
  const { onboardingComplete, loading: profileLoading } = useBirthData();
  const { palette, accent } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  const profileHydrating = !!session && profileLoading;
  const loading = authLoading || profileHydrating;

  useEffect(() => {
    if (loading) return;

    const group = segments[0] as string | undefined;
    const inAuth = group === '(auth)';
    const inOnboarding = group === '(onboarding)';

    if (!session && !inAuth) {
      router.replace('/(auth)/login');
    } else if (session && !onboardingComplete && !inOnboarding) {
      router.replace('/(onboarding)/splash' as never);
    } else if (session && onboardingComplete && (inAuth || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [session, onboardingComplete, loading, segments]);

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: palette.background }}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="horoscope/[category]" />
      <Stack.Screen name="tarot/[cardId]" />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Pavot-Bold': require('../assets/fonts/Pavot-Bold.otf'),
    'Pavot-BoldItalic': require('../assets/fonts/Pavot-BoldItalic.otf'),
    'Pavot-Light': require('../assets/fonts/Pavot-Light.otf'),
    'Pavot-LightItalic': require('../assets/fonts/Pavot-LightItalic.otf'),
    'Pavot-Regular': require('../assets/fonts/Pavot-Regular.otf'),
    'Pavot-RegularItalic': require('../assets/fonts/Pavot-RegularItalic.otf'),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BirthDataProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </BirthDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
