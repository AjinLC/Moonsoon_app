import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import { useSession } from '@/context/AuthContext';
import { useBirthData } from '@/context/BirthDataContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useSeed } from '@/context/SeedContext';
import { Accents, AccentName } from '@/constants/theme';
import { Toggle } from '@/components/Toggle';
import { BottomSheetModal } from '@/components/BottomSheetModal';
import { CityAutocomplete, CitySelection } from '@/components/CityAutocomplete';
import { Fonts } from '@/constants/fonts';
import { BackgroundGlyphs } from '@/components/BackgroundGlyphs';
import { formatDate, formatTime, isoDate, isoTime } from '@/utils/date';

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
  tabs: { key: string; label: string }[];
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

function YourChart() {
  const { t, i18n } = useTranslation();
  const { palette } = useTheme();
  const { dateOfBirth, timeOfBirth, placeOfBirth } = useBirthData();

  const dob = dateOfBirth ? new Date(dateOfBirth) : null;
  const dobLabel = dob
    ? dob.toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';
  const timeLabel = timeOfBirth ? timeOfBirth.slice(0, 5) : '—';

  const born =
    t('profile.bornDate', { date: dobLabel }) +
    (timeOfBirth ? t('profile.bornAtTime', { time: timeLabel }) : '') +
    (placeOfBirth ? t('profile.bornInPlace', { place: placeOfBirth }) : '') +
    '.';

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
      <Caption>{t('profile.yourBirthChart')}</Caption>
      <Text style={{ fontSize: 15, lineHeight: 22, color: palette.textPrimary }}>{born}</Text>

      <Divider />
      <Caption>{t('profile.bigThree')}</Caption>
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
      <Caption>{t('profile.houses')}</Caption>
      <Text
        style={{
          fontSize: 13,
          lineHeight: 20,
          color: palette.textSecondary,
          marginBottom: 24,
        }}>
        {t('profile.housesLead')}
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

type EditField = 'name' | 'dob' | 'tob' | 'place';

function Settings() {
  const { t } = useTranslation();
  const { palette, accent, themePreference, setThemePreference, accentName, setAccent } =
    useTheme();
  const birth = useBirthData();
  const prefs = usePreferences();
  const { user, session, signOut } = useSession();
  const { seedSource } = useSeed();
  const router = useRouter();

  const [editing, setEditing] = useState<EditField | null>(null);
  const [draftText, setDraftText] = useState('');
  const [draftDate, setDraftDate] = useState(new Date(1995, 0, 1));
  const [draftCoords, setDraftCoords] = useState<CitySelection | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const readingSourceLabel: Record<string, string> = {
    birth: t('profile.readingSourceBirth'),
    location: t('profile.readingSourceLocation'),
    random: t('profile.readingSourceRandom'),
    loading: '—',
  };

  const Caption = ({ children, style }: { children: string; style?: object }) => (
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

  const openEdit = (field: EditField) => {
    setShowPicker(false);
    setDraftCoords(null);
    if (field === 'name') setDraftText(birth.name ?? '');
    if (field === 'place') setDraftText(birth.placeOfBirth ?? '');
    if (field === 'dob')
      setDraftDate(
        birth.dateOfBirth ? new Date(`${birth.dateOfBirth}T12:00:00`) : new Date(1995, 0, 1)
      );
    if (field === 'tob') {
      const base = new Date();
      if (birth.timeOfBirth) {
        base.setHours(parseInt(birth.timeOfBirth.slice(0, 2), 10));
        base.setMinutes(parseInt(birth.timeOfBirth.slice(3, 5), 10));
      }
      setDraftDate(base);
    }
    setEditing(field);
  };

  const saveEdit = async () => {
    if (editing === 'name') await birth.save({ name: draftText.trim() || null });
    if (editing === 'dob') await birth.save({ dateOfBirth: isoDate(draftDate) });
    if (editing === 'tob') await birth.save({ timeOfBirth: isoTime(draftDate) });
    if (editing === 'place') {
      const coordsValid = draftCoords !== null && draftCoords.label === draftText.trim();
      await birth.save({
        placeOfBirth: draftText.trim() || null,
        birthLat: coordsValid ? draftCoords.lat : null,
        birthLng: coordsValid ? draftCoords.lng : null,
      });
    }
    setEditing(null);
  };

  const deleteAccount = () => {
    Alert.alert(t('profile.deleteTitle'), t('profile.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          if (!session) return;
          setDeleting(true);
          try {
            const fnUrl =
              process.env.EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL ||
              `${process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''}/functions/v1`;
            const res = await fetch(`${fnUrl}/delete-account`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (!res.ok) throw new Error(`delete failed: ${res.status}`);
            await signOut();
          } catch {
            Alert.alert(t('profile.deleteError'));
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const accountFields: { key: string; label: string; value: string; edit?: EditField }[] = [
    { key: 'name', label: t('profile.name'), value: birth.name ?? '—', edit: 'name' },
    { key: 'email', label: t('profile.email'), value: user?.email ?? '—' },
    {
      key: 'dob',
      label: t('onboarding.dateOfBirth'),
      value: birth.dateOfBirth ?? '—',
      edit: 'dob',
    },
    {
      key: 'tob',
      label: t('onboarding.timeOfBirth'),
      value: birth.timeOfBirth?.slice(0, 5) ?? '—',
      edit: 'tob',
    },
    {
      key: 'place',
      label: t('onboarding.placeOfBirth'),
      value: birth.placeOfBirth ?? '—',
      edit: 'place',
    },
  ];

  const themeSegments: { id: 'system' | 'light' | 'dark'; label: string }[] = [
    { id: 'system', label: t('profile.themeSystem') },
    { id: 'light', label: t('profile.themeLight') },
    { id: 'dark', label: t('profile.themeDark') },
  ];

  const detailSegments: { id: 'brief' | 'standard'; label: string }[] = [
    { id: 'brief', label: t('profile.detailBrief') },
    { id: 'standard', label: t('profile.detailStandard') },
  ];

  const modalTitle: Record<EditField, string> = {
    name: t('profile.name'),
    dob: t('onboarding.dateOfBirth'),
    tob: t('onboarding.timeOfBirth'),
    place: t('onboarding.placeOfBirth'),
  };

  return (
    <View>
      <Caption style={{ marginBottom: 16 }}>{t('profile.account')}</Caption>
      {accountFields.map((f, i) => (
        <View key={f.key}>
          {i > 0 && (
            <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 16 }} />
          )}
          <Text style={{ fontSize: 11, color: palette.textTertiary, marginBottom: 4 }}>
            {f.label}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ flex: 1, fontSize: 15, color: palette.textPrimary }}>{f.value}</Text>
            {f.edit && (
              <Pressable onPress={() => openEdit(f.edit as EditField)} hitSlop={8}>
                <Text style={{ fontSize: 13, color: accent }}>{t('common.edit')}</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 32 }} />

      <Caption style={{ marginBottom: 16 }}>{t('profile.preferences')}</Caption>

      {/* Accent color */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ flex: 1, fontSize: 15, color: palette.textPrimary }}>
          {t('profile.accentColor')}
        </Text>
        {(Object.keys(Accents) as AccentName[]).map((name) => {
          const on = accentName === name;
          return (
            <Pressable
              key={name}
              onPress={() => setAccent(name)}
              hitSlop={6}
              style={{
                width: 24,
                height: 24,
                marginLeft: 12,
                backgroundColor: Accents[name],
                borderWidth: on ? 1 : 0,
                borderColor: palette.textPrimary,
              }}
            />
          );
        })}
      </View>

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 16 }} />

      {/* Notification toggles */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ flex: 1, fontSize: 15, color: palette.textPrimary }}>
          {t('profile.dailyNotifications')}
        </Text>
        <Toggle
          on={prefs.notificationsHoroscope}
          onChange={() => prefs.save({ notificationsHoroscope: !prefs.notificationsHoroscope })}
          accent={accent}
          border={palette.border}
        />
      </View>

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 16 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ flex: 1, fontSize: 15, color: palette.textPrimary }}>
          {t('onboarding.mantraReminders')}
        </Text>
        <Toggle
          on={prefs.notificationsMantra}
          onChange={() => prefs.save({ notificationsMantra: !prefs.notificationsMantra })}
          accent={accent}
          border={palette.border}
        />
      </View>

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 16 }} />

      {/* Horoscope detail level */}
      <Text style={{ fontSize: 15, color: palette.textPrimary, marginBottom: 12 }}>
        {t('profile.horoscopeDetailLevel')}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          height: 36,
          borderWidth: 0.5,
          borderColor: palette.border,
        }}>
        {detailSegments.map((seg, idx) => {
          const on = prefs.horoscopeDetailLevel === seg.id;
          return (
            <Pressable
              key={seg.id}
              onPress={() => prefs.save({ horoscopeDetailLevel: seg.id })}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: on ? palette.surface : 'transparent',
                borderRightWidth: idx < detailSegments.length - 1 ? 0.5 : 0,
                borderRightColor: palette.border,
                borderBottomWidth: on ? 0.5 : 0,
                borderBottomColor: accent,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  color: on ? palette.textPrimary : palette.textSecondary,
                }}>
                {seg.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 16 }} />
      <Text style={{ fontSize: 15, color: palette.textPrimary, marginBottom: 12 }}>
        {t('profile.theme')}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          height: 36,
          borderWidth: 0.5,
          borderColor: palette.border,
        }}>
        {themeSegments.map((seg, idx) => {
          const on = themePreference === seg.id;
          return (
            <Pressable
              key={seg.id}
              onPress={() => setThemePreference(seg.id)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: on ? palette.surface : 'transparent',
                borderRightWidth: idx < themeSegments.length - 1 ? 0.5 : 0,
                borderRightColor: palette.border,
                borderBottomWidth: on ? 0.5 : 0,
                borderBottomColor: accent,
                opacity: on ? 1 : 0.85,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  color: on ? palette.textPrimary : palette.textSecondary,
                }}>
                {seg.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 16 }} />
      <View>
        <Text style={{ fontSize: 15, color: palette.textPrimary }}>
          {t('profile.readingSource')}
        </Text>
        <Text style={{ fontSize: 13, color: palette.textTertiary, marginTop: 4 }}>
          {readingSourceLabel[seedSource]}
        </Text>
      </View>

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 32 }} />

      <Pressable onPress={() => router.push('/paywall' as never)}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, color: palette.textPrimary }}>
              {t('profile.subscription')}
            </Text>
            <Text style={{ fontSize: 13, color: palette.textTertiary, marginTop: 4 }}>
              {t('profile.freePlan')}
            </Text>
          </View>
          <Text style={{ fontSize: 18, color: palette.textTertiary }}>›</Text>
        </View>
      </Pressable>

      <View style={{ height: 0.5, backgroundColor: palette.border, marginVertical: 24 }} />

      <Pressable onPress={signOut}>
        <Text style={{ fontSize: 15, color: palette.textPrimary, paddingVertical: 12 }}>
          {t('profile.signOut')}
        </Text>
      </Pressable>
      <View style={{ height: 0.5, backgroundColor: palette.border }} />
      <Pressable onPress={deleteAccount} disabled={deleting}>
        <Text
          style={{
            fontSize: 15,
            color: palette.textPrimary,
            paddingVertical: 12,
            opacity: deleting ? 0.5 : 1,
          }}>
          {t('profile.deleteAccount')}
        </Text>
      </Pressable>
      <View style={{ height: 0.5, backgroundColor: palette.border }} />

      {/* Edit-field modal */}
      <BottomSheetModal visible={editing !== null} onClose={() => setEditing(null)}>
        {editing && (
          <>
            <Text
              style={{
                fontFamily: Fonts.headingSemi,
                fontSize: 18,
                color: palette.textPrimary,
                marginBottom: 24,
              }}>
              {modalTitle[editing]}
            </Text>

            {editing === 'name' && (
              <TextInput
                value={draftText}
                onChangeText={setDraftText}
                autoFocus
                placeholder={t('profile.name')}
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
            )}

            {editing === 'place' && (
              <CityAutocomplete
                value={draftText}
                onChangeText={setDraftText}
                onSelect={setDraftCoords}
              />
            )}

            {(editing === 'dob' || editing === 'tob') && (
              <>
                <Pressable
                  onPress={() => setShowPicker(true)}
                  style={{
                    height: 48,
                    borderWidth: 1,
                    borderColor: palette.border,
                    backgroundColor: palette.surface,
                    justifyContent: 'center',
                    paddingHorizontal: 12,
                  }}>
                  <Text style={{ fontSize: 15, color: palette.textPrimary }}>
                    {editing === 'dob' ? formatDate(draftDate) : formatTime(draftDate)}
                  </Text>
                </Pressable>
                {showPicker && (
                  <DateTimePicker
                    value={draftDate}
                    mode={editing === 'dob' ? 'date' : 'time'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(e, d) => {
                      setShowPicker(Platform.OS === 'ios');
                      if (d) setDraftDate(d);
                    }}
                  />
                )}
              </>
            )}

            <Pressable
              onPress={saveEdit}
              style={{
                height: 48,
                backgroundColor: accent,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 32,
              }}>
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>
                {t('common.save')}
              </Text>
            </Pressable>
          </>
        )}
      </BottomSheetModal>
    </View>
  );
}

export default function Profile() {
  const { t } = useTranslation();
  const { palette, accent } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'chart' | 'settings'>('chart');

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <BackgroundGlyphs variant="profile" />
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{
          paddingTop: insets.top + 32,
          paddingBottom: 64,
          paddingHorizontal: 32,
        }}>
        <SubTabs
          tabs={[
            { key: 'chart', label: t('profile.yourChart') },
            { key: 'settings', label: t('profile.settings') },
          ]}
          active={tab}
          onChange={(key) => setTab(key as 'chart' | 'settings')}
          accent={accent}
          palette={palette}
        />
        <View style={{ height: 0.5, backgroundColor: palette.border, marginBottom: 32 }} />
        {tab === 'chart' ? <YourChart /> : <Settings />}
      </ScrollView>
    </View>
  );
}
