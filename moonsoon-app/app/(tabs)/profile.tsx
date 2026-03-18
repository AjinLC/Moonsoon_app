import { useState } from 'react';
import { Text, View, Pressable, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSession } from '../../context/AuthContext';

export default function Profile() {
  const { user, signOut } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      Alert.alert('Erreur', 'Impossible de se déconnecter. Réessayez.');
      setSigningOut(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6">
      {/* Avatar placeholder */}
      <View className="items-center pt-8">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-indigo-100">
          <FontAwesome name="user" size={40} color="#6366f1" />
        </View>
      </View>

      {/* User info */}
      <View className="mt-8 rounded-2xl bg-gray-50 p-4">
        <Text className="mb-1 text-sm text-gray-500">Email</Text>
        <Text className="text-base font-medium text-gray-900">
          {user?.email ?? '—'}
        </Text>
      </View>

      <View className="mt-4 rounded-2xl bg-gray-50 p-4">
        <Text className="mb-1 text-sm text-gray-500">Membre depuis</Text>
        <Text className="text-base font-medium text-gray-900">
          {user?.created_at
            ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : '—'}
        </Text>
      </View>

      {/* Sign out */}
      <View className="mt-auto pb-8">
        <Pressable
          onPress={handleSignOut}
          disabled={signingOut}
          className="items-center rounded-2xl bg-red-50 py-4">
          <Text className="text-base font-semibold text-red-600">
            {signingOut ? 'Déconnexion…' : 'Se déconnecter'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
