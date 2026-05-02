import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useSession } from '@/context/AuthContext';
import { useBirthData } from '@/context/BirthDataContext';
import { Fonts } from '@/constants/fonts';

const BIG_THREE = [
  {
    title: 'Sun in Pisces',
    body: 'Your sun in Pisces marks an essential softness — a sensitivity that catches what other people walk past. You feel weather before the forecast, you feel rooms before they speak. The work of your life is to honor that without dissolving into it.\n\nPisces gives you imagination as a survival tool. The risk is escapism; the gift is that you can re-enter the world with something the world did not have before you went looking.\n\nCarry boundaries the way you carry the tide — they go in, they go out, but you stay you.',
  },
  {
    title: 'Moon in Cancer',
    body: 'Your inner life is governed by water and memory. The moon in Cancer means you process by remembering, and you remember by feeling. Home — the idea of it, the making of it — is your central project, even when the surface of your life looks like something else.\n\nYou heal in cycles. Trust that nothing in you is final. What feels overwhelming this month will be furniture by next year.',
  },
  {
    title: 'Rising in Leo',
    body: 'You arrive before you arrive. The Leo rising gives you a quiet luminosity that other people read as confidence even when you are quietly unsure. Use it. The world will mistake your warmth for power; let that misreading be the door you walk through.\n\nDress for yourself, but accept that being seen is part of your medicine.',
  },
];

const HOUSES = [
  { title: '1st House — Leo', body: 'You lead with warmth, presence, and a touch of theatre.' },
  {
    title: '4th House — Scorpio',
    body: 'Home life carries depth and privacy; you guard your inner world fiercely.',
  },
  {
    title: '7th House — Aquarius',
    body: 'Partnerships flourish when they leave room for friendship and difference.',
  },
  {
    title: '10th House — Taurus',
    body: 'Your public path rewards patience and the slow building of something durable.',
  },
];

function SubTabs({
  tabs,
  active,
  onChange,
  accent,
  palette,
}: {
  tabs: string[];
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

function YourChart() {
  const { palette } = useTheme();
  const { dateOfBirth, timeOfBirth, placeOfBirth } = useBirthData();

  const dob = dateOfBirth ? new Date(dateOfBirth) : null;
  const dobLabel = dob
    ? dob.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';
  const timeLabel = timeOfBirth ? timeOfBirth.slice(0, 5) : '—';

  const Caption = ({ children }: { children: string }) => (
    <Text
      style={{
        fontSize: 11,
        fontWeight: '500',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: palette.textTertiary,
        marginBottom: 16,
      }}>
      {children}
    </Text>
  );

  const Divider = () => (
    <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 32 }} />
  );

  return (
    <View>
      <Caption>Your birth chart</Caption>
      <Text style={{ fontSize: 15, lineHeight: 22, color: palette.textPrimary }}>
        Born {dobLabel}
        {timeOfBirth ? ` at ${timeLabel}` : ''}
        {placeOfBirth ? ` in ${placeOfBirth}` : ''}.
      </Text>

      <Divider />
      <Caption>The Big Three</Caption>
      {BIG_THREE.map((item, i) => (
        <View key={item.title}>
          {i > 0 && (
            <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 28 }} />
          )}
          <Text
            style={{
              fontFamily: Fonts.heading,
              fontSize: 24,
              color: palette.textPrimary,
              marginBottom: 16,
            }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 24, color: palette.textPrimary }}>
            {item.body}
          </Text>
        </View>
      ))}

      <Divider />
      <Caption>Houses & Placements</Caption>
      <Text
        style={{
          fontSize: 13,
          lineHeight: 20,
          color: palette.textSecondary,
          marginBottom: 24,
        }}>
        The houses describe the rooms of your life — where each sign’s energy lives and works.
      </Text>
      {HOUSES.map((h, i) => (
        <View key={h.title}>
          {i > 0 && (
            <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 16 }} />
          )}
          <Text style={{ fontSize: 15, fontWeight: '500', color: palette.textPrimary }}>
            {h.title}
          </Text>
          <Text
            style={{
              fontSize: 13,
              lineHeight: 20,
              color: palette.textTertiary,
              marginTop: 6,
            }}>
            {h.body}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Settings() {
  const { palette, accent, mode, setMode, accentName } = useTheme();
  const { name, dateOfBirth, timeOfBirth, placeOfBirth } = useBirthData();
  const { user, signOut } = useSession();
  const router = useRouter();

  const Caption = ({ children, style }: { children: string; style?: any }) => (
    <Text
      style={[
        {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: palette.textTertiary,
        },
        style,
      ]}>
      {children}
    </Text>
  );

  const accountFields: { label: string; value: string }[] = [
    { label: 'Name', value: name ?? '—' },
    { label: 'Email', value: user?.email ?? '—' },
    { label: 'Date of birth', value: dateOfBirth ?? '—' },
    { label: 'Time of birth', value: timeOfBirth?.slice(0, 5) ?? '—' },
    { label: 'Place of birth', value: placeOfBirth ?? '—' },
  ];

  const prefRows: { label: string; value: string }[] = [
    { label: 'Accent color', value: accentName },
    { label: 'Theme', value: mode },
    { label: 'Daily notifications', value: 'On' },
    { label: 'Mantra reminders', value: '07:00' },
    { label: 'Horoscope detail level', value: 'Standard' },
  ];

  return (
    <View>
      <Caption style={{ marginBottom: 16 }}>Account</Caption>
      {accountFields.map((f, i) => (
        <View key={f.label}>
          {i > 0 && (
            <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 16 }} />
          )}
          <Text style={{ fontSize: 11, color: palette.textTertiary, marginBottom: 4 }}>
            {f.label}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15, color: palette.textPrimary }}>{f.value}</Text>
            <Pressable>
              <Text style={{ fontSize: 13, color: accent }}>Edit</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 32 }} />

      <Caption style={{ marginBottom: 16 }}>Preferences</Caption>
      {prefRows.map((row, i) => (
        <Pressable
          key={row.label}
          onPress={() => {
            if (row.label === 'Theme') setMode(mode === 'light' ? 'dark' : 'light');
          }}>
          {i > 0 && (
            <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 16 }} />
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: palette.textPrimary }}>{row.label}</Text>
              <Text style={{ fontSize: 13, color: palette.textTertiary, marginTop: 4 }}>
                {row.value}
              </Text>
            </View>
            <Text style={{ fontSize: 18, color: palette.textTertiary }}>›</Text>
          </View>
        </Pressable>
      ))}

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 32 }} />

      <Pressable onPress={() => router.push('/paywall' as never)}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, color: palette.textPrimary }}>Subscription</Text>
            <Text style={{ fontSize: 13, color: palette.textTertiary, marginTop: 4 }}>
              Free plan
            </Text>
          </View>
          <Text style={{ fontSize: 18, color: palette.textTertiary }}>›</Text>
        </View>
      </Pressable>

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 24 }} />

      <Pressable onPress={signOut}>
        <Text style={{ fontSize: 15, color: palette.textPrimary, paddingVertical: 12 }}>
          Sign out
        </Text>
      </Pressable>
      <View style={{ height: 0.5, backgroundColor: palette.border }} />
      <Pressable>
        <Text style={{ fontSize: 15, color: palette.textPrimary, paddingVertical: 12 }}>
          Delete account
        </Text>
      </Pressable>
      <View style={{ height: 0.5, backgroundColor: palette.border }} />
    </View>
  );
}

export default function Profile() {
  const { palette, accent } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'Your chart' | 'Settings'>('Your chart');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 32,
        paddingBottom: 64,
        paddingHorizontal: 32,
      }}>
      <SubTabs
        tabs={['Your chart', 'Settings']}
        active={tab}
        onChange={(t) => setTab(t as any)}
        accent={accent}
        palette={palette}
      />
      <View style={{ height: 0.5, backgroundColor: palette.border, marginBottom: 32 }} />
      {tab === 'Your chart' ? <YourChart /> : <Settings />}
    </ScrollView>
  );
}
