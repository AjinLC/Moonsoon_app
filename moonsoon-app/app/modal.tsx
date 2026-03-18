import { StatusBar } from 'expo-status-bar';
import { Text, View, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function Modal() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-xl font-bold">Hello Modal</Text>

      <Pressable
        onPress={() => router.back()}
        className="mt-8 rounded-full bg-indigo-500 px-6 py-3"
      >
        <Text className="text-base font-semibold text-white">Close</Text>
      </Pressable>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}