import { Stack } from 'expo-router';
import { supabase } from '../../utils/supabase'
import { Text, View } from 'react-native';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Profile' }} />
      <View className="flex-1 p-6">
        <Text className="text-xl">Hello Profile</Text>
      </View>
    </>
  );
}
