import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <View className="flex-1 p-6">
        <Text className="text-xl">Hello Index</Text>
      </View>
    </>
  );
}
