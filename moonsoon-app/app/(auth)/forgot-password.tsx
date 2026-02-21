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

export default function ForgotPassword() {
  // ---- State ----
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---- Submit handler ----
  const handleReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      // This URL is where Supabase redirects after the user clicks the reset link.
      // For mobile deep-linking you'll configure this later with your app scheme.
      // For now we leave it undefined which uses Supabase's default behaviour.
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(true);
  };

  // ---- Success state ----
  if (success) {
    return (
      <View className="flex-1 bg-white justify-center px-8">
        <Text className="text-3xl font-bold text-center mb-4">Email Sent</Text>
        <Text className="text-base text-gray-500 text-center mb-8">
          If an account exists for{' '}
          <Text className="font-semibold text-gray-700">{email}</Text>, you'll receive a password
          reset link shortly. Check your inbox (and spam folder).
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="bg-indigo-600 rounded-xl py-4 items-center">
            <Text className="text-white text-base font-semibold">Back to Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

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
          <Text className="text-3xl font-bold text-center mb-2">Reset Password</Text>
          <Text className="text-base text-gray-500 text-center mb-10">
            Enter your email and we'll send you a reset link
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
            className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-base bg-gray-50"
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            className={`rounded-xl py-4 items-center ${loading ? 'bg-indigo-300' : 'bg-indigo-600'}`}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">Send Reset Link</Text>
            )}
          </TouchableOpacity>

          {/* Back to login */}
          <View className="flex-row justify-center mt-8">
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-indigo-600 font-semibold">Back to Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}