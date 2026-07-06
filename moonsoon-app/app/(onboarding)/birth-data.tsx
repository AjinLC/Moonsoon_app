import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useBirthData } from '@/context/BirthDataContext';
import { CityAutocomplete, CitySelection } from '@/components/CityAutocomplete';
import { Fonts } from '@/constants/fonts';
import { formatDate, formatTime, isoDate, isoTime } from '@/utils/date';

export default function BirthData() {
  const { t } = useTranslation();
  const { palette, accent } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { save } = useBirthData();

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [place, setPlace] = useState('');
  const [coords, setCoords] = useState<CitySelection | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [saving, setSaving] = useState(false);

  const next = async (skip = false) => {
    setSaving(true);
    if (!skip) {
      // Coordinates only count when they belong to the text still in the field.
      const coordsValid = coords !== null && coords.label === place.trim();
      await save({
        dateOfBirth: date ? isoDate(date) : null,
        timeOfBirth: time ? isoTime(time) : null,
        placeOfBirth: place.trim() || null,
        birthLat: coordsValid ? coords.lat : null,
        birthLng: coordsValid ? coords.lng : null,
      });
    }
    setSaving(false);
    router.push('/(onboarding)/preferences' as never);
  };

  const Field = ({
    label,
    value,
    placeholder,
    helper,
    onPress,
    children,
  }: {
    label: string;
    value?: string;
    placeholder: string;
    helper: string;
    onPress?: () => void;
    children?: React.ReactNode;
  }) => (
    <View style={{ marginBottom: 32 }}>
      <View style={{ height: 0.5, backgroundColor: palette.border, marginBottom: 12 }} />
      <Text
        style={{
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: palette.textTertiary,
          marginBottom: 8,
        }}>
        {label}
      </Text>
      {children ?? (
        <Pressable
          onPress={onPress}
          style={{
            height: 48,
            borderWidth: 1,
            borderColor: palette.border,
            backgroundColor: palette.surface,
            justifyContent: 'center',
            paddingHorizontal: 12,
          }}>
          <Text
            style={{
              fontSize: 15,
              color: value ? palette.textPrimary : palette.textTertiary,
            }}>
            {value || placeholder}
          </Text>
        </Pressable>
      )}
      <Text
        style={{
          fontSize: 13,
          color: palette.textTertiary,
          marginTop: 8,
        }}>
        {helper}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 32,
        }}
        keyboardShouldPersistTaps="handled">
        <Text
          style={{
            fontFamily: Fonts.display,
            fontSize: 32,
            lineHeight: 38,
            color: palette.textPrimary,
            marginBottom: 12,
          }}>
          {t('onboarding.birthDataTitle')}
        </Text>
        <Text
          style={{
            fontSize: 15,
            lineHeight: 22,
            color: palette.textSecondary,
            marginBottom: 40,
          }}>
          {t('onboarding.birthDataLead')}
        </Text>

        <Field
          label={t('onboarding.dateOfBirth')}
          value={date ? formatDate(date) : undefined}
          placeholder={t('onboarding.datePlaceholder')}
          helper={t('onboarding.dateHelper')}
          onPress={() => setShowDate(true)}
        />
        {showDate && (
          <DateTimePicker
            value={date ?? new Date(1995, 0, 1)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, d) => {
              setShowDate(Platform.OS === 'ios');
              if (d) setDate(d);
            }}
          />
        )}

        <Field
          label={t('onboarding.timeOfBirth')}
          value={time ? formatTime(time) : undefined}
          placeholder={t('onboarding.timePlaceholder')}
          helper={t('onboarding.timeHelper')}
          onPress={() => setShowTime(true)}
        />
        {showTime && (
          <DateTimePicker
            value={time ?? new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, t) => {
              setShowTime(Platform.OS === 'ios');
              if (t) setTime(t);
            }}
          />
        )}

        <Field
          label={t('onboarding.placeOfBirth')}
          placeholder={t('onboarding.placePlaceholder')}
          helper={t('onboarding.placeHelper')}>
          <CityAutocomplete value={place} onChangeText={setPlace} onSelect={setCoords} />
        </Field>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={() => next(false)}
          disabled={saving}
          style={{
            height: 48,
            backgroundColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: saving ? 0.6 : 1,
            marginTop: 24,
          }}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
            {t('onboarding.calculate')}
          </Text>
        </Pressable>
        <Pressable onPress={() => next(true)} style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Text style={{ color: palette.textSecondary, fontSize: 15 }}>{t('common.skip')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
