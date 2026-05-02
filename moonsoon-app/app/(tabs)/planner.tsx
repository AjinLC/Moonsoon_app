import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { Fonts } from '@/constants/fonts';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Mon=0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

const HOURS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];

const SAMPLE_EVENTS = [
  { hour: 9, duration: 1, title: 'Morning pages', sub: '30 min' },
  { hour: 11, duration: 2, title: 'Strategy call — Anya', sub: '1 hr' },
  { hour: 15, duration: 1, title: 'Walk in the park', sub: '45 min' },
];

const NO_TIME = ['Reply to Marla', 'Pick up dry cleaning', 'Order new journal'];

const GOALS = {
  'This week': [
    {
      goal: '“Write one honest thing each morning, before the noise.”',
      context: 'Mornings will become your unbroken hour. Begin small — three sentences will do.',
      progress: 5,
      total: 7,
      task: 'Today: write three sentences before coffee',
    },
    {
      goal: '“Walk for thirty minutes without my phone.”',
      context: 'You think more clearly when nothing is asking for you. Let the city be the company.',
      progress: 3,
      total: 5,
      task: 'Today: a slow loop after lunch',
    },
  ],
  'This month': [
    {
      goal: '“Finish the long letter you’ve been drafting in your head.”',
      context: 'It does not need to be perfect to be sent. It needs to be true and to be done.',
      progress: 2,
      total: 4,
      task: 'Today: 200 words, no editing',
    },
  ],
  'This year': [
    {
      goal: '“Build a body of work I can stand behind.”',
      context: 'Quiet, steady, unsensational. The kind of practice that compounds.',
      progress: 18,
      total: 52,
      task: 'Today: ship the small thing',
    },
  ],
};

function SubTabs({
  tabs,
  active,
  onChange,
  accent,
  palette,
}: {
  tabs: readonly string[];
  active: string;
  onChange: (t: string) => void;
  accent: string;
  palette: { textPrimary: string; textTertiary: string };
}) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
      {tabs.map((t) => {
        const on = t === active;
        return (
          <Pressable
            key={t}
            onPress={() => onChange(t)}
            style={{ marginRight: 32, paddingBottom: 12 }}>
            <Text
              style={{
                fontSize: 15,
                color: on ? palette.textPrimary : palette.textTertiary,
              }}>
              {t}
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

function Calendar() {
  const { palette, accent } = useTheme();
  const [today] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const week = startOfWeek(today);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(week);
    d.setDate(week.getDate() + i);
    return d;
  });

  const monthLabel = today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <View>
      {/* Month + nav */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}>
        <Text style={{ fontSize: 18, color: palette.textTertiary }}>‹</Text>
        <Text
          style={{ fontFamily: Fonts.headingSemi, fontSize: 18, color: palette.textPrimary }}>
          {monthLabel}
        </Text>
        <Text style={{ fontSize: 18, color: palette.textTertiary }}>›</Text>
      </View>

      {/* Day headers */}
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {DAYS.map((d, i) => (
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
          const isSel = d.toDateString() === selected.toDateString();
          const hasEvent = d.getDay() % 2 === 0;
          return (
            <Pressable
              key={d.toISOString()}
              onPress={() => setSelected(d)}
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
                  backgroundColor: hasEvent ? accent : 'transparent',
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
        const event = SAMPLE_EVENTS.find((e) => e.hour === parseInt(h, 10));
        const rowHeight = 56;
        return (
          <View key={h} style={{ flexDirection: 'row', minHeight: rowHeight }}>
            <View style={{ width: 36, alignItems: 'flex-end', paddingRight: 12, paddingTop: 4 }}>
              <Text style={{ fontSize: 11, color: palette.textTertiary }}>{h}:00</Text>
            </View>
            <View style={{ flex: 1, borderTopWidth: 0.5, borderTopColor: palette.border }}>
              {event && (
                <View
                  style={{
                    backgroundColor: palette.surface,
                    borderWidth: 1,
                    borderColor: palette.border,
                    minHeight: rowHeight * event.duration - 8,
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
                      color: palette.textPrimary,
                    }}>
                    {event.title}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: palette.textTertiary, marginTop: 2 }}>
                    {event.sub}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 24 }} />

      <Text style={{ fontFamily: Fonts.headingSemi, fontSize: 18, color: palette.textPrimary }}>
        No set time
      </Text>
      <Text style={{ fontSize: 13, color: palette.textTertiary, marginTop: 4, marginBottom: 16 }}>
        Open tasks for today, in no particular order.
      </Text>

      {NO_TIME.map((task) => (
        <View
          key={task}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
          }}>
          <Text style={{ fontSize: 15, color: palette.textTertiary, marginRight: 16 }}>=</Text>
          <Text style={{ fontSize: 15, color: palette.textPrimary }}>{task}</Text>
        </View>
      ))}

      <Pressable style={{ paddingVertical: 16 }}>
        <Text style={{ fontSize: 15, color: accent }}>+ Add task</Text>
      </Pressable>
    </View>
  );
}

function Goals() {
  const { palette, accent } = useTheme();
  const scopes = ['This week', 'This month', 'This year'] as const;
  type Scope = (typeof scopes)[number];
  const [scope, setScope] = useState<Scope>('This week');

  const items = GOALS[scope];

  return (
    <View>
      <SubTabs
        tabs={scopes}
        active={scope}
        onChange={(t) => setScope(t as Scope)}
        accent={accent}
        palette={palette}
      />
      <View style={{ height: 0.5, backgroundColor: palette.border, marginBottom: 24 }} />

      {items.map((g, i) => (
        <View key={g.goal}>
          {i > 0 && (
            <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 24 }} />
          )}
          <Text
            style={{
              fontFamily: Fonts.headingSemi,
              fontSize: 18,
              color: palette.textPrimary,
              marginBottom: 12,
            }}>
            {g.goal}
          </Text>
          <Text
            style={{
              fontSize: 13,
              lineHeight: 20,
              color: palette.textTertiary,
              marginBottom: 16,
            }}>
            {g.context}
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
                  width: `${(g.progress / g.total) * 100}%`,
                  height: 4,
                  backgroundColor: accent,
                }}
              />
            </View>
            <Text style={{ fontSize: 13, color: palette.textSecondary }}>
              {g.progress}/{g.total}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: palette.textTertiary, marginTop: 12 }}>
            Today: {g.task}
          </Text>
        </View>
      ))}

      <Pressable style={{ paddingVertical: 16, marginTop: 16 }}>
        <Text style={{ fontSize: 15, color: accent }}>+ Add a new goal</Text>
      </Pressable>
    </View>
  );
}

export default function Planner() {
  const { palette, accent } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'Calendar' | 'Goals'>('Calendar');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 32,
        paddingBottom: 64,
        paddingHorizontal: 32,
      }}>
      <SubTabs
        tabs={['Calendar', 'Goals']}
        active={tab}
        onChange={(t) => setTab(t as any)}
        accent={accent}
        palette={palette}
      />
      <View style={{ height: 0.5, backgroundColor: palette.border, marginBottom: 24 }} />

      {tab === 'Calendar' ? <Calendar /> : <Goals />}
    </ScrollView>
  );
}
