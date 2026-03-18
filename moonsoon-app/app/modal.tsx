import { StatusBar } from 'expo-status-bar';
import { Text, View, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function Modal() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white p-6">
      <View className="flex-1 items-center justify-center">
        {/* App icon */}
        <View className="h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100">
          <FontAwesome name="moon-o" size={36} color="#6366f1" />
        </View>

        <Text className="mt-6 text-2xl font-bold text-gray-900">Moonsoon</Text>
        <Text className="mt-2 text-base text-gray-500">Version 1.0.0</Text>

        {/* Info cards */}
        <View className="mt-8 w-full gap-3">
          <View className="flex-row items-center rounded-xl bg-gray-50 p-4">
            <FontAwesome name="code" size={18} color="#6366f1" />
            <Text className="ml-3 text-sm text-gray-700">
              Expo SDK 54 + React Native 0.81
            </Text>
          </View>
          <View className="flex-row items-center rounded-xl bg-gray-50 p-4">
            <FontAwesome name="database" size={18} color="#6366f1" />
            <Text className="ml-3 text-sm text-gray-700">
              Supabase (Auth + Database)
            </Text>
          </View>
          <View className="flex-row items-center rounded-xl bg-gray-50 p-4">
            <FontAwesome name="paint-brush" size={18} color="#6366f1" />
            <Text className="ml-3 text-sm text-gray-700">
              NativeWind (Tailwind CSS)
            </Text>
          </View>
        </View>
      </View>

      {/* Close button */}
      <Pressable
        onPress={() => router.back()}
        className="mb-4 items-center rounded-2xl bg-indigo-500 py-4">
        <Text className="text-base font-semibold text-white">Fermer</Text>
      </Pressable>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
