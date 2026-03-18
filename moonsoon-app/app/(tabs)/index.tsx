import { Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSession } from '../../context/AuthContext';

export default function Home() {
  const { user } = useSession();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <View className="flex-1 bg-white p-6">
      {/* Greeting */}
      <View className="pt-4">
        <Text className="text-2xl font-bold text-gray-900">
          {greeting()} 👋
        </Text>
        <Text className="mt-1 text-base text-gray-500">
          {user?.email ?? 'Bienvenue sur Moonsoon'}
        </Text>
      </View>

      {/* Quick stats cards */}
      <View className="mt-8 flex-row gap-4">
        <View className="flex-1 rounded-2xl bg-indigo-50 p-4">
          <FontAwesome name="cloud" size={24} color="#6366f1" />
          <Text className="mt-2 text-2xl font-bold text-indigo-600">—</Text>
          <Text className="mt-1 text-sm text-gray-500">Météo</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-amber-50 p-4">
          <FontAwesome name="calendar" size={24} color="#d97706" />
          <Text className="mt-2 text-2xl font-bold text-amber-600">—</Text>
          <Text className="mt-1 text-sm text-gray-500">Événements</Text>
        </View>
      </View>

      {/* Placeholder content area */}
      <View className="mt-8 flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-8">
        <FontAwesome name="rocket" size={40} color="#d1d5db" />
        <Text className="mt-4 text-center text-base text-gray-400">
          Le contenu principal de l'app sera ici
        </Text>
      </View>
    </View>
  );
}
