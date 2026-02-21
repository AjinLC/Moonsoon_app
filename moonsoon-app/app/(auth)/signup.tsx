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
import { Link, router } from 'expo-router';
import { supabase } from '../../utils/supabase';

export default function Signup() {
  // ---- State ----
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---- Submit handler ----
  const handleSignup = async () => {
    // Client-side validation
    if (!email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // If your Supabase project has "Confirm email" enabled (the default),
    // the user gets an email and we show a success message.
    // If you've disabled email confirmation, onAuthStateChange fires
    // and the root layout will redirect to (tabs) automatically.
    setSuccess(true);
  };

  // ---- Success state ----
  if (success) {
    return (
      <View className="flex-1 bg-white justify-center px-8">
        <Text className="text-3xl font-bold text-center mb-4">Check Your Email</Text>
        <Text className="text-base text-gray-500 text-center mb-8">
          We sent a confirmation link to{' '}
          <Text className="font-semibold text-gray-700">{email}</Text>. Tap the link in the email,
          then come back and sign in.
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="bg-indigo-600 rounded-xl py-4 items-center">
            <Text className="text-white text-base font-semibold">Go to Sign In</Text>
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
          <Text className="text-3xl font-bold text-center mb-2">Create Account</Text>
          <Text className="text-base text-gray-500 text-center mb-10">
            Sign up to get started
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
            className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-base bg-gray-50"
            placeholder="At least 6 characters"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
          />

          {/* Confirm Password */}
          <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">Confirm Password</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-6 text-base bg-gray-50"
            placeholder="Re-enter your password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
          />

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className={`rounded-xl py-4 items-center ${loading ? 'bg-indigo-300' : 'bg-indigo-600'}`}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-indigo-600 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}