import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useTasks, TaskRow } from '@/hooks/useTasks';
import { useGoals, GoalScope } from '@/hooks/useGoals';
import { BottomSheetModal } from '@/components/BottomSheetModal';
import { Fonts } from '@/constants/fonts';
import { BackgroundGlyphs } from '@/components/BackgroundGlyphs';
import { formatDate, formatTime, isoDate, isoTime } from '@/utils/date';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const HOURS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Mon=0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function SubTabs({
  tabs,
  active,
  onChange,
  accent,
  palette,
}: {
  tabs: readonly { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
  accent: string;
  palette: { textPrimary: string; textTertiary: string };
}) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
      {tabs.map(({ key, label }) => {
        const on = key === active;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={{ marginRight: 32, paddingBottom: 12 }}>
            <Text
              style={{
                fontSize: 15,
                color: on ? palette.textPrimary : palette.textTertiary,
              }}>
              {label}
            </Text>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: 70,
                height: 2,
                backgroundColor: on ? accent : 'transparent',
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

function FieldLabel({ children, color }: { children: string; color: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color,
        marginBottom: 8,
        marginTop: 16,
      }}>
      {children}
    </Text>
  );
}

function Calendar() {
  const { t, i18n } = useTranslation();
  const { palette, accent } = useTheme();
  const [weekOffset, setWeekOffset] = useState(0);

  const week = useMemo(() => {
    const base = startOfWeek(new Date());
    base.setDate(base.getDate() + weekOffset * 7);
    return base;
  }, [weekOffset]);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(week);
        d.setDate(week.getDate() + i);
        return d;
      }),
    [week]
  );

  const [selected, setSelected] = useState(() => isoDate(new Date()));

  const changeWeek = (delta: number) => {
    const nextOffset = weekOffset + delta;
    setWeekOffset(nextOffset);
    const base = startOfWeek(new Date());
    base.setDate(base.getDate() + nextOffset * 7);
    // Land on today when returning to the current week, else on Monday.
    setSelected(nextOffset === 0 ? isoDate(new Date()) : isoDate(base));
  };

  const fromISO = isoDate(days[0]);
  const toISO = isoDate(days[6]);
  const { tasks, refresh, addTask, toggleTask, deleteTask } = useTasks(fromISO, toISO);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Month label follows the week's Thursday so it flips mid-week transitions sensibly.
  const monthLabel = days[3].toLocaleDateString(i18n.language, {
    month: 'long',
    year: 'numeric',
  });

  const dayTasks = tasks.filter((task) => task.due_date === selected);
  const timed = dayTasks.filter((task) => task.due_time !== null);
  const untimed = dayTasks.filter((task) => task.due_time === null);
  const daysWithTasks = new Set(tasks.map((task) => task.due_date));

  // ---- Add-task modal state ----
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState<Date | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const openModal = () => {
    setTitle('');
    setDate(new Date(`${selected}T12:00:00`));
    setTime(null);
    setShowDate(false);
    setShowTime(false);
    setModalOpen(true);
  };

  const saveTask = async () => {
    if (!title.trim()) return;
    await addTask(title, isoDate(date), time ? isoTime(time) : null);
    setModalOpen(false);
  };

  const confirmDelete = (task: TaskRow) => {
    Alert.alert(t('planner.deleteTask'), task.title, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteTask(task.id) },
    ]);
  };

  const pickerField = (value: string, onPress: () => void) => (
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
      <Text style={{ fontSize: 15, color: palette.textPrimary }}>{value}</Text>
    </Pressable>
  );

  return (
    <View>
      {/* Month + week nav */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}>
        <Pressable onPress={() => changeWeek(-1)} hitSlop={12}>
          <Text style={{ fontSize: 18, color: palette.textTertiary }}>‹</Text>
        </Pressable>
        <Text style={{ fontFamily: Fonts.headingSemi, fontSize: 18, color: palette.textPrimary }}>
          {monthLabel}
        </Text>
        <Pressable onPress={() => changeWeek(1)} hitSlop={12}>
          <Text style={{ fontSize: 18, color: palette.textTertiary }}>›</Text>
        </Pressable>
      </View>

      {/* Day headers */}
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {DAY_LETTERS.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '500',
                letterSpacing: 1.5,
                color: palette.textTertiary,
              }}>
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Date row */}
      <View style={{ flexDirection: 'row', marginBottom: 24 }}>
        {days.map((d) => {
          const iso = isoDate(d);
          const isSel = iso === selected;
          const hasTask = daysWithTasks.has(iso);
          return (
            <Pressable
              key={iso}
              onPress={() => setSelected(iso)}
              style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSel ? accent : 'transparent',
                }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: isSel ? '#FFFFFF' : palette.textPrimary,
                  }}>
                  {d.getDate()}
                </Text>
              </View>
              <View
                style={{
                  width: 4,
                  height: 4,
                  backgroundColor: hasTask ? accent : 'transparent',
                  marginTop: 6,
                }}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: 0.5, backgroundColor: palette.border, marginBottom: 24 }} />

      {/* Time grid */}
      {HOURS.map((h) => {
        const hourTasks = timed.filter(
          (task) => parseInt((task.due_time as string).slice(0, 2), 10) === parseInt(h, 10)
        );
        const rowHeight = 56;
        return (
          <View key={h} style={{ flexDirection: 'row', minHeight: rowHeight }}>
            <View style={{ width: 36, alignItems: 'flex-end', paddingRight: 12, paddingTop: 4 }}>
              <Text style={{ fontSize: 11, color: palette.textTertiary }}>{h}:00</Text>
            </View>
            <View style={{ flex: 1, borderTopWidth: 0.5, borderTopColor: palette.border }}>
              {hourTasks.map((task) => (
                <Pressable
                  key={task.id}
                  onLongPress={() => confirmDelete(task)}
                  style={{
                    backgroundColor: palette.surface,
                    borderWidth: 1,
                    borderColor: palette.border,
                    minHeight: rowHeight - 8,
                    marginVertical: 4,
                    paddingVertical: 10,
                    paddingLeft: 16,
                    paddingRight: 12,
                  }}>
                  <View
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      backgroundColor: accent,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '500',
                      color: task.done ? palette.textTertiary : palette.textPrimary,
                    }}>
                    {task.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: palette.textTertiary, marginTop: 2 }}>
                    {(task.due_time as string).slice(0, 5)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 24 }} />

      <Text style={{ fontFamily: Fonts.headingSemi, fontSize: 18, color: palette.textPrimary }}>
        {t('planner.noSetTime')}
      </Text>
      <Text style={{ fontSize: 13, color: palette.textTertiary, marginTop: 4, marginBottom: 16 }}>
        {t('planner.noSetTimeHelper')}
      </Text>

      {untimed.length === 0 && (
        <Text style={{ fontSize: 13, color: palette.textTertiary, paddingVertical: 4 }}>
          {t('planner.emptyDay')}
        </Text>
      )}
      {untimed.map((task) => (
        <Pressable
          key={task.id}
          onPress={() => toggleTask(task.id)}
          onLongPress={() => confirmDelete(task)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
          }}>
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
            }}>
            {task.done && <Feather name="check" size={12} color="#FFFFFF" />}
          </View>
          <Text
            style={{
              fontSize: 15,
              color: task.done ? palette.textTertiary : palette.textPrimary,
            }}>
            {task.title}
          </Text>
        </Pressable>
      ))}

      <Pressable onPress={openModal} style={{ paddingVertical: 16 }}>
        <Text style={{ fontSize: 15, color: accent }}>{t('planner.addTask')}</Text>
      </Pressable>

      {/* Add-task modal */}
      <BottomSheetModal visible={modalOpen} onClose={() => setModalOpen(false)}>
        <Text style={{ fontFamily: Fonts.headingSemi, fontSize: 18, color: palette.textPrimary }}>
          {t('planner.newTask')}
        </Text>

        <FieldLabel color={palette.textTertiary}>{t('planner.titleLabel')}</FieldLabel>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t('planner.titlePlaceholder')}
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

        <FieldLabel color={palette.textTertiary}>{t('planner.dateLabel')}</FieldLabel>
        {pickerField(formatDate(date), () => setShowDate(true))}
        {showDate && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, d) => {
              setShowDate(Platform.OS === 'ios');
              if (d) setDate(d);
            }}
          />
        )}

        <FieldLabel color={palette.textTertiary}>{t('planner.timeLabel')}</FieldLabel>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            {pickerField(time ? formatTime(time) : t('planner.noTimeOption'), () =>
              setShowTime(true)
            )}
          </View>
          {time && (
            <Pressable
              onPress={() => setTime(null)}
              style={{
                width: 48,
                height: 48,
                borderWidth: 1,
                borderColor: palette.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Feather name="x" size={16} color={palette.textSecondary} />
            </Pressable>
          )}
        </View>
        {showTime && (
          <DateTimePicker
            value={time ?? new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, picked) => {
              setShowTime(Platform.OS === 'ios');
              if (picked) setTime(picked);
            }}
          />
        )}

        <Pressable
          onPress={saveTask}
          disabled={!title.trim()}
          style={{
            height: 48,
            backgroundColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 32,
            opacity: title.trim() ? 1 : 0.5,
          }}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
            {t('common.save')}
          </Text>
        </Pressable>
      </BottomSheetModal>
    </View>
  );
}

function Goals() {
  const { t } = useTranslation();
  const { palette, accent } = useTheme();
  const scopes: { key: GoalScope; label: string }[] = [
    { key: 'week', label: t('planner.thisWeek') },
    { key: 'month', label: t('planner.thisMonth') },
    { key: 'year', label: t('planner.thisYear') },
  ];
  const [scope, setScope] = useState<GoalScope>('week');
  const { goals, refresh, addGoal, incrementProgress, deleteGoal } = useGoals();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const items = goals.filter((g) => g.scope === scope);

  // ---- Add-goal modal state ----
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [newScope, setNewScope] = useState<GoalScope>('week');
  const [target, setTarget] = useState('7');

  const openModal = () => {
    setTitle('');
    setNewScope(scope);
    setTarget('7');
    setModalOpen(true);
  };

  const saveGoal = async () => {
    if (!title.trim()) return;
    await addGoal(title, newScope, parseInt(target, 10) || 1);
    setModalOpen(false);
  };

  const confirmDelete = (id: string, goalTitle: string) => {
    Alert.alert(t('planner.deleteGoal'), goalTitle, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteGoal(id) },
    ]);
  };

  return (
    <View>
      <SubTabs
        tabs={scopes}
        active={scope}
        onChange={(key) => setScope(key as GoalScope)}
        accent={accent}
        palette={palette}
      />
      <View style={{ height: 0.5, backgroundColor: palette.border, marginBottom: 24 }} />

      {items.length === 0 && (
        <Text style={{ fontSize: 13, color: palette.textTertiary, paddingVertical: 4 }}>
          {t('planner.emptyGoals')}
        </Text>
      )}
      {items.map((g, i) => (
        <View key={g.id}>
          {i > 0 && (
            <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 24 }} />
          )}
          <Pressable onLongPress={() => confirmDelete(g.id, g.title)}>
            <Text
              style={{
                fontFamily: Fonts.headingSemi,
                fontSize: 18,
                color: palette.textPrimary,
                marginBottom: 16,
              }}>
              {g.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  flex: 1,
                  height: 4,
                  backgroundColor: palette.border,
                  marginRight: 12,
                }}>
                <View
                  style={{
                    width: `${Math.min(100, (g.progress / g.target) * 100)}%`,
                    height: 4,
                    backgroundColor: accent,
                  }}
                />
              </View>
              <Text style={{ fontSize: 13, color: palette.textSecondary, marginRight: 12 }}>
                {g.progress}/{g.target}
              </Text>
              <Pressable
                onPress={() => incrementProgress(g.id)}
                disabled={g.progress >= g.target}
                hitSlop={8}
                style={{
                  width: 24,
                  height: 24,
                  borderWidth: 1,
                  borderColor: g.progress >= g.target ? palette.border : accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 15,
                    color: g.progress >= g.target ? palette.textTertiary : accent,
                    lineHeight: 18,
                  }}>
                  +
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </View>
      ))}

      <Pressable onPress={openModal} style={{ paddingVertical: 16, marginTop: 16 }}>
        <Text style={{ fontSize: 15, color: accent }}>{t('planner.addGoal')}</Text>
      </Pressable>

      {/* Add-goal modal */}
      <BottomSheetModal visible={modalOpen} onClose={() => setModalOpen(false)}>
        <Text style={{ fontFamily: Fonts.headingSemi, fontSize: 18, color: palette.textPrimary }}>
          {t('planner.newGoal')}
        </Text>

        <FieldLabel color={palette.textTertiary}>{t('planner.titleLabel')}</FieldLabel>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t('planner.titlePlaceholder')}
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

        <FieldLabel color={palette.textTertiary}>{t('planner.scopeLabel')}</FieldLabel>
        <View
          style={{
            flexDirection: 'row',
            height: 36,
            borderWidth: 0.5,
            borderColor: palette.border,
          }}>
          {scopes.map(({ key, label }) => {
            const on = newScope === key;
            return (
              <Pressable
                key={key}
                onPress={() => setNewScope(key)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: on ? palette.surface : 'transparent',
                  borderBottomWidth: on ? 0.5 : 0,
                  borderBottomColor: accent,
                }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: on ? palette.textPrimary : palette.textSecondary,
                  }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FieldLabel color={palette.textTertiary}>{t('planner.targetLabel')}</FieldLabel>
        <TextInput
          value={target}
          onChangeText={setTarget}
          keyboardType="number-pad"
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

        <Pressable
          onPress={saveGoal}
          disabled={!title.trim()}
          style={{
            height: 48,
            backgroundColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 32,
            opacity: title.trim() ? 1 : 0.5,
          }}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
            {t('common.save')}
          </Text>
        </Pressable>
      </BottomSheetModal>
    </View>
  );
}

export default function Planner() {
  const { t } = useTranslation();
  const { palette, accent } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'calendar' | 'goals'>('calendar');

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <BackgroundGlyphs variant="planner" />
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{
          paddingTop: insets.top + 32,
          paddingBottom: 64,
          paddingHorizontal: 32,
        }}>
        <SubTabs
          tabs={[
            { key: 'calendar', label: t('planner.calendar') },
            { key: 'goals', label: t('planner.goals') },
          ]}
          active={tab}
          onChange={(key) => setTab(key as 'calendar' | 'goals')}
          accent={accent}
          palette={palette}
        />
        <View style={{ height: 0.5, backgroundColor: palette.border, marginBottom: 24 }} />

        {tab === 'calendar' ? <Calendar /> : <Goals />}
      </ScrollView>
    </View>
  );
}
