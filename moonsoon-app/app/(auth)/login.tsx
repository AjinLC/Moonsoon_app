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
import { useTranslation } from 'react-i18next';
import { supabase } from '../../utils/supabase';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../constants/fonts';

export default function Login() {
  const { t } = useTranslation();
  const { palette, accent } = useTheme();

  // ---- State ----
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ---- Submit handler ----
  const handleLogin = async () => {
    // Basic client-side validation
    if (!email.trim() || !password) {
      setError(t('auth.fillBothFields'));
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

  const labelStyle = {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: palette.textTertiary,
    marginBottom: 8,
  };

  const inputStyle = {
    height: 48,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: 12,
    fontSize: 15,
    color: palette.textPrimary,
  };

  // ---- UI ----
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
          {/* Header */}
          <Text
            style={{
              fontFamily: Fonts.display,
              fontSize: 32,
              lineHeight: 38,
              color: palette.textPrimary,
              marginBottom: 8,
            }}>
            {t('auth.welcome')}
          </Text>
          <Text style={{ fontSize: 15, color: palette.textSecondary, marginBottom: 40 }}>
            {t('auth.signInLead')}
          </Text>

          {/* Error banner */}
          {error ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: '#B4433A',
                paddingHorizontal: 12,
                paddingVertical: 12,
                marginBottom: 16,
              }}>
              <Text style={{ color: '#B4433A', fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          {/* Email */}
          <Text style={labelStyle}>{t('auth.email')}</Text>
          <TextInput
            style={[inputStyle, { marginBottom: 16 }]}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={palette.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />

          {/* Password */}
          <Text style={labelStyle}>{t('auth.password')}</Text>
          <TextInput
            style={[inputStyle, { marginBottom: 8 }]}
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor={palette.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
          />

          {/* Forgot password link */}
          <Link href="./forgot-password" asChild>
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
              <Text style={{ color: accent, fontSize: 13, fontWeight: '500' }}>
                {t('auth.forgotPassword')}
              </Text>
            </TouchableOpacity>
          </Link>

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              height: 48,
              backgroundColor: accent,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.6 : 1,
            }}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                {t('auth.signIn')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Signup link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
            <Text style={{ color: palette.textSecondary, fontSize: 15 }}>
              {t('auth.noAccount')}{' '}
            </Text>
            <Link href="./signup" asChild>
              <TouchableOpacity>
                <Text style={{ color: accent, fontSize: 15, fontWeight: '600' }}>
                  {t('auth.signUp')}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
