import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { Fonts } from '@/constants/fonts';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const { palette, accent } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          backgroundColor: palette.background,
        }}>
        <Text
          style={{
            fontFamily: Fonts.heading,
            fontSize: 20,
            color: palette.textPrimary,
            textAlign: 'center',
          }}>
          {t('notFound.title')}
        </Text>
        <Link href="/" style={{ marginTop: 16, paddingVertical: 16 }}>
          <Text style={{ fontSize: 15, color: accent }}>{t('notFound.goHome')}</Text>
        </Link>
      </View>
    </>
  );
}
