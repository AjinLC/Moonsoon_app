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

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { palette, accent } = useTheme();

  // ---- State ----
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ---- Submit handler ----
  const handleReset = async () => {
    if (!email.trim()) {
      setError(t('auth.enterEmail'));
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
          {t('auth.emailSentTitle')}
        </Text>
        <Text
          style={{
            fontSize: 15,
            lineHeight: 22,
            color: palette.textSecondary,
            marginBottom: 32,
          }}>
          {t('auth.emailSentBody', { email })}
        </Text>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={ctaStyle}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
              {t('auth.backToSignIn')}
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
            {t('auth.resetTitle')}
          </Text>
          <Text style={{ fontSize: 15, color: palette.textSecondary, marginBottom: 40 }}>
            {t('auth.resetLead')}
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
          <Text
            style={{
              fontSize: 11,
              fontWeight: '500',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: palette.textTertiary,
              marginBottom: 8,
            }}>
            {t('auth.email')}
          </Text>
          <TextInput
            style={{
              height: 48,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.surface,
              paddingHorizontal: 12,
              fontSize: 15,
              color: palette.textPrimary,
              marginBottom: 24,
            }}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={palette.textTertiary}
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
            style={[ctaStyle, { opacity: loading ? 0.6 : 1 }]}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                {t('auth.sendResetLink')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to login */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={{ color: accent, fontSize: 15, fontWeight: '600' }}>
                  {t('auth.backToSignIn')}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
