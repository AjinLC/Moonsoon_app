import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useSeed } from '@/context/SeedContext';
import { useBirthData } from '@/context/BirthDataContext';
import { useTasks } from '@/hooks/useTasks';
import { MANTRAS_POOL, getDailyHoroscopeParams, sunSignFromDate } from '@/utils/horoscope';
import { Fonts } from '@/constants/fonts';
import { BackgroundGlyphs } from '@/components/BackgroundGlyphs';
import { isoDate } from '@/utils/date';

const CATEGORY_KEYS = ['love', 'friends', 'family', 'career'] as const;

export default function Home() {
  const { t, i18n } = useTranslation();
  const { palette, accent } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { seed } = useSeed();
  const { dateOfBirth } = useBirthData();

  const todayISO = isoDate(new Date());
  const { tasks, refresh, toggleTask } = useTasks(todayISO, todayISO);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const dayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(i18n.language, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    [i18n.language]
  );

  const sunSign = sunSignFromDate(dateOfBirth);

  const params = useMemo(
    () => (seed != null ? getDailyHoroscopeParams(seed, sunSign) : null),
    [seed, sunSign]
  );

  const mantra = params != null ? MANTRAS_POOL[params.mantraIndex] : MANTRAS_POOL[0];

  // Pseudo-distribute the three intensities across the four categories.
  const intensityFor = (idx: number): number => {
    if (!params) return 0;
    const ring = [params.loveIntensity, params.careerIntensity, params.energyIntensity];
    if (idx === 0) return params.loveIntensity;
    if (idx === 3) return params.careerIntensity;
    return ring[idx % 3];
  };

  const completed = tasks.filter((task) => task.done).length;

  const Divider = () => (
    <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 32 }} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <BackgroundGlyphs variant="home" />
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 48 }}>
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
            {t('home.headline')}
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 24, color: palette.textPrimary }}>
            {t('home.horoscopeBody')}
          </Text>
        </View>

        <View className="px-8">
          <Divider />
        </View>

        <View className="px-8">
          <Text
            style={{
              fontFamily: Fonts.bodyItalic,
              fontSize: 24,
              lineHeight: 32,
              color: palette.textPrimary,
              marginBottom: 12,
            }}>
            “{mantra}”
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 24, color: palette.textSecondary }}>
            {t('home.mantraNote')}
          </Text>
        </View>

        <View className="px-8">
          <Divider />
        </View>

        <View className="px-8">
          <Text
            style={{
              fontFamily: Fonts.headingSemi,
              fontSize: 18,
              color: palette.textPrimary,
            }}>
            {t('home.todaysTasks')}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: palette.textTertiary,
              marginTop: 4,
              marginBottom: 24,
            }}>
            {t('home.tasksProgress', { done: completed, total: tasks.length })}
          </Text>
          {tasks.length === 0 && (
            <Text style={{ fontSize: 13, color: palette.textTertiary }}>{t('home.emptyDay')}</Text>
          )}
          {tasks.map((task, i) => (
            <View key={task.id}>
              {i > 0 && (
                <View
                  style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 16 }}
                />
              )}
              <Pressable
                onPress={() => toggleTask(task.id)}
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
                    {task.due_time ? task.due_time.slice(0, 5) : t('planner.noTimeOption')}
                  </Text>
                </View>
              </Pressable>
            </View>
          ))}
        </View>

        <View className="px-8">
          <Divider />
        </View>

        <View className="px-8">
          <Text
            style={{
              fontFamily: Fonts.headingSemi,
              fontSize: 18,
              color: palette.textPrimary,
              marginBottom: 8,
            }}>
            {t('home.yourHoroscope')}
          </Text>
          {CATEGORY_KEYS.map((key, i) => {
            const intensity = intensityFor(i);
            return (
              <View key={key}>
                <View style={{ height: 0.5, backgroundColor: palette.border, marginTop: 24 }} />
                <Pressable
                  onPress={() => router.push(`/horoscope/${key}` as never)}
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
                      {t(`home.categories.${key}`)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        lineHeight: 22,
                        color: palette.textSecondary,
                        marginBottom: 12,
                      }}>
                      {t(`home.excerpts.${key}`)}
                    </Text>
                    <View style={{ height: 4, backgroundColor: palette.border }}>
                      <View
                        style={{
                          height: 4,
                          width: `${intensity}%`,
                          backgroundColor: accent,
                        }}
                      />
                    </View>
                  </View>
                  <Text style={{ fontSize: 18, color: palette.textTertiary, marginTop: 2 }}>›</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
