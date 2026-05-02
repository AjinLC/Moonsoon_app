import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Fonts } from '@/constants/fonts';

const today = new Date();
const dayLabel = today.toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

const HOROSCOPE_HEADLINE = 'The stars lean in your favor today.';
const HOROSCOPE_BODY =
  'Mercury sharpens your thinking and softens your speech, making this an unusually good day for the conversations you have been putting off. The Moon in Cancer asks you to lead with care. Trust the slow movements; nothing today rewards the rush.';

const MANTRA = 'I move at the pace of my own knowing.';
const MANTRA_NOTE =
  'Repeat this morning and night. Let the rhythm of the words match the rhythm of your breath.';

const initialTasks = [
  { id: '1', title: 'Morning pages', time: '07:00', done: true },
  { id: '2', title: 'Walk without your phone', time: '12:30', done: true },
  { id: '3', title: 'Send the email you have been avoiding', time: '15:00', done: true },
  { id: '4', title: 'Read for thirty minutes', time: '18:00', done: false },
  { id: '5', title: 'Set tomorrow’s intention', time: '21:30', done: false },
];

const categories = [
  {
    key: 'love',
    title: 'Love',
    excerpt:
      'A small honesty becomes a doorway. Speak the soft thing you almost kept to yourself.',
  },
  {
    key: 'friends',
    title: 'Friends',
    excerpt:
      'Old loyalties resurface. Let the conversation drift into territory you have not crossed in years.',
  },
  {
    key: 'family',
    title: 'Family',
    excerpt:
      'A reminder of where you come from arrives gently. Receive it without making it a verdict.',
  },
  {
    key: 'career',
    title: 'Career',
    excerpt:
      'You can see two moves ahead. Trust the long game and decline the urgency that does not belong to you.',
  },
];

export default function Home() {
  const { palette, accent } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState(initialTasks);

  const completed = tasks.filter((t) => t.done).length;

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const Divider = () => (
    <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 32 }} />
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 48 }}>
      {/* Section 1 — Header */}
      <View className="px-8">
        <Text
          style={{
            fontSize: 11,
            fontWeight: '500',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: palette.textTertiary,
            marginBottom: 16,
          }}>
          {dayLabel}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.display,
            fontSize: 32,
            lineHeight: 38,
            color: palette.textPrimary,
            marginBottom: 24,
          }}>
          {HOROSCOPE_HEADLINE}
        </Text>
        <Text
          style={{
            fontSize: 15,
            lineHeight: 24,
            color: palette.textPrimary,
          }}>
          {HOROSCOPE_BODY}
        </Text>
      </View>

      <View className="px-8">
        <Divider />
      </View>

      {/* Section 2 — Mantra */}
      <View className="px-8">
        <Text
          style={{
            fontFamily: Fonts.bodyItalic,
            fontSize: 24,
            lineHeight: 32,
            color: palette.textPrimary,
            marginBottom: 12,
          }}>
          “{MANTRA}”
        </Text>
        <Text
          style={{
            fontSize: 15,
            lineHeight: 24,
            color: palette.textSecondary,
          }}>
          {MANTRA_NOTE}
        </Text>
      </View>

      <View className="px-8">
        <Divider />
      </View>

      {/* Section 3 — Today's tasks */}
      <View className="px-8">
        <Text
          style={{
            fontFamily: Fonts.headingSemi,
            fontSize: 18,
            color: palette.textPrimary,
          }}>
          Today’s tasks
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: palette.textTertiary,
            marginTop: 4,
            marginBottom: 24,
          }}>
          {completed} of {tasks.length} completed
        </Text>
        {tasks.map((task, i) => (
          <View key={task.id}>
            {i > 0 && (
              <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 16 }} />
            )}
            <Pressable
              onPress={() => toggle(task.id)}
              style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderWidth: 1,
                  borderColor: task.done ? accent : palette.border,
                  backgroundColor: task.done ? accent : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                  marginTop: 2,
                }}>
                {task.done && <Feather name="check" size={12} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <View>
                  <Text
                    style={{
                      fontSize: 15,
                      lineHeight: 20,
                      color: task.done ? palette.textTertiary : palette.textPrimary,
                    }}>
                    {task.title}
                  </Text>
                  {task.done && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 0,
                        right: 0,
                        height: 0.5,
                        backgroundColor: palette.textTertiary,
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    color: palette.textTertiary,
                    marginTop: 4,
                  }}>
                  {task.time}
                </Text>
              </View>
            </Pressable>
          </View>
        ))}
      </View>

      <View className="px-8">
        <Divider />
      </View>

      {/* Section 4 — Horoscope categories */}
      <View className="px-8">
        <Text
          style={{
            fontFamily: Fonts.headingSemi,
            fontSize: 18,
            color: palette.textPrimary,
            marginBottom: 8,
          }}>
          Your horoscope today
        </Text>
        {categories.map((c) => (
          <View key={c.key}>
            <View style={{ height: 0.5, backgroundColor: palette.border, marginTop: 24 }} />
            <Pressable
              onPress={() => router.push(`/horoscope/${c.key}` as never)}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                paddingTop: 20,
              }}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text
                  style={{
                    fontFamily: Fonts.headingSemi,
                    fontSize: 18,
                    color: palette.textPrimary,
                    marginBottom: 8,
                  }}>
                  {c.title}
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    lineHeight: 22,
                    color: palette.textSecondary,
                  }}>
                  {c.excerpt}
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: palette.textTertiary, marginTop: 2 }}>›</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
