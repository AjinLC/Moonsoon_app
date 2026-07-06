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

export default function Signup() {
  const { t } = useTranslation();
  const { palette, accent } = useTheme();

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
      setError(t('auth.fillAllFields'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
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

  const ctaStyle = {
    height: 48,
    backgroundColor: accent,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  // ---- Success state ----
  if (success) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: palette.background,
          justifyContent: 'center',
          paddingHorizontal: 32,
        }}>
        <Text
          style={{
            fontFamily: Fonts.display,
            fontSize: 32,
            lineHeight: 38,
            color: palette.textPrimary,
            marginBottom: 16,
          }}>
          {t('auth.checkEmailTitle')}
        </Text>
        <Text
          style={{
            fontSize: 15,
            lineHeight: 22,
            color: palette.textSecondary,
            marginBottom: 32,
          }}>
          {t('auth.checkEmailBody', { email })}
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={ctaStyle}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
              {t('auth.goToSignIn')}
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

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
            {t('auth.createAccount')}
          </Text>
          <Text style={{ fontSize: 15, color: palette.textSecondary, marginBottom: 40 }}>
            {t('auth.signUpLead')}
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
            style={[inputStyle, { marginBottom: 16 }]}
            placeholder={t('auth.passwordPlaceholderMin')}
            placeholderTextColor={palette.textTertiary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            autoComplete="new-password"
          />

          {/* Confirm Password */}
          <Text style={labelStyle}>{t('auth.confirmPassword')}</Text>
          <TextInput
            style={[inputStyle, { marginBottom: 24 }]}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            placeholderTextColor={palette.textTertiary}
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
            style={[ctaStyle, { opacity: loading ? 0.6 : 1 }]}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                {t('auth.createAccount')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
            <Text style={{ color: palette.textSecondary, fontSize: 15 }}>
              {t('auth.haveAccount')}{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={{ color: accent, fontSize: 15, fontWeight: '600' }}>
                  {t('auth.signIn')}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
