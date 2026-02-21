import '../global.css';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useSession } from '../context/AuthContext';

// ─── Inner component that has access to the auth context ───
function RootNavigator() {
  const { session, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while we're still loading the session from storage
    if (loading) return;

    // Check which route group the user is currently in
    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // No session and not on an auth screen → send to login
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Has session but still on an auth screen → send to main app
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  // Show a loading spinner while we hydrate the session
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Slot renders whichever child route is active: (auth)/* or (tabs)/*
  return <Slot />;
}

// ─── Root layout wraps everything in providers ───
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}