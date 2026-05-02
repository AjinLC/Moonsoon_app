import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useBirthData } from '@/context/BirthDataContext';
import { Fonts } from '@/constants/fonts';

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')} / ${String(d.getMonth() + 1).padStart(2, '0')} / ${d.getFullYear()}`;
const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')} : ${String(d.getMinutes()).padStart(2, '0')}`;
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const isoTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`;

export default function BirthData() {
  const { palette, accent } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { save } = useBirthData();

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [place, setPlace] = useState('');
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [saving, setSaving] = useState(false);

  const next = async (skip = false) => {
    setSaving(true);
    if (!skip) {
      await save({
        dateOfBirth: date ? isoDate(date) : null,
        timeOfBirth: time ? isoTime(time) : null,
        placeOfBirth: place.trim() || null,
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
          Your birth, in full.
        </Text>
        <Text
          style={{
            fontSize: 15,
            lineHeight: 22,
            color: palette.textSecondary,
            marginBottom: 40,
          }}>
          We use this to calculate your chart. The more precise, the more honest the reading.
        </Text>

        <Field
          label="Date of birth"
          value={date ? formatDate(date) : undefined}
          placeholder="DD / MM / YYYY"
          helper="Use the date on your birth certificate."
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
          label="Time of birth"
          value={time ? formatTime(time) : undefined}
          placeholder="HH : MM"
          helper="Check your birth certificate if you can."
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
          label="Place of birth"
          placeholder="City, Country"
          helper="A nearby major city is fine if you’re unsure.">
          <TextInput
            value={place}
            onChangeText={setPlace}
            placeholder="City, Country"
            placeholderTextColor={palette.textTertiary}
            style={{
              height: 48,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.surface,
              paddingHorizontal: 12,
              fontSize: 15,
              color: palette.textPrimary,
            }}
          />
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
            Calculate my chart
          </Text>
        </Pressable>
        <Pressable
          onPress={() => next(true)}
          style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Text style={{ color: palette.textSecondary, fontSize: 15 }}>Skip for now</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
