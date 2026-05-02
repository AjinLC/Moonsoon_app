import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Fonts } from '@/constants/fonts';

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace('/(onboarding)/birth-data' as never), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <Pressable
      onPress={() => router.replace('/(onboarding)/birth-data' as never)}
      style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
      {/* Thin cross — vertical 0.5 × 120, horizontal 100 × 0.5, both centered */}
      <View
        style={{
          width: 100,
          height: 120,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 48,
        }}>
        <View
          style={{
            position: 'absolute',
            width: 0.5,
            height: 120,
            backgroundColor: '#FFFFFF',
          }}
        />
        <View
          style={{
            position: 'absolute',
            width: 100,
            height: 0.5,
            backgroundColor: '#FFFFFF',
          }}
        />
      </View>
      <Text
        style={{
          fontFamily: Fonts.display,
          fontSize: 32,
          color: '#FFFFFF',
          marginBottom: 12,
        }}>
        moonsoon
      </Text>
      <Text style={{ fontSize: 15, color: '#999999' }}>align with the stars</Text>
    </Pressable>
  );
}
