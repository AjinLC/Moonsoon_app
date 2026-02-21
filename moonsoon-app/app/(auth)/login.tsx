import { Stack } from 'expo-router';
import { supabase } from '../../utils/supabase'
import { Text, View, TextInput,  } from 'react-native';

export default function Login() {
    return (
        <>
            <Stack.Screen options={{ title: 'Login' }} />
            <View className="flex-1 p-6">
                <Text className="text-xl">Hello Login</Text>
                <TextInput className="border border-gray-300 rounded-md p-2 mt-4" placeholder="Email" />
                <TextInput className="border border-gray-300 rounded-md p-2 mt-4" placeholder="Password" />
            </View>
        </>
    )
}