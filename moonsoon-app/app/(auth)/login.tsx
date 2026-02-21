import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../utils/supabase';

export default function Login() {
  // ---- State ----
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ---- Submit handler ----
  const handleLogin = async () => {
    // Basic client-side validation
    if (!email.trim() || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    }
    // On success, onAuthStateChange fires → session updates → root layout redirects to (tabs)
  };

  // ---- UI ----
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-8">
          {/* Header */}
          <Text className="text-3xl font-bold text-center mb-2">Welcome Back</Text>
          <Text className="text-base text-gray-500 text-center mb-10">
            Sign in to your account
          </Text>

          {/* Error banner */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base bg-gray-50"
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />

          {/* Password */}
          <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">Password</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-2 text-base bg-gray-50"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
          />

          {/* Forgot password link */}
          <Link href="./forgot-password" asChild>
            <TouchableOpacity className="self-end mb-6">
              <Text className="text-indigo-600 text-sm font-medium">Forgot password?</Text>
            </TouchableOpacity>
          </Link>

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`rounded-xl py-4 items-center ${loading ? 'bg-indigo-300' : 'bg-indigo-600'}`}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Signup link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500">Don't have an account? </Text>
            <Link href="./signup" asChild>
              <TouchableOpacity>
                <Text className="text-indigo-600 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}