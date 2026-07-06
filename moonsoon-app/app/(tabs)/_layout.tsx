import { Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';

const TABS = [
  { name: 'index', key: 'home', icon: 'home' as const },
  { name: 'planner', key: 'planner', icon: 'calendar' as const },
  { name: 'tarot', key: 'tarot', icon: 'layers' as const },
  { name: 'profile', key: 'profile', icon: 'user' as const },
];

export default function TabLayout() {
  const { t } = useTranslation();
  const { palette, accent } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: palette.surface,
            borderTopWidth: 0.5,
            borderTopColor: palette.border,
            paddingBottom: insets.bottom,
            elevation: 0,
            shadowOpacity: 0,
          }}>
          {state.routes.map((route, index) => {
            const tab = TABS.find((t) => t.name === route.name);
            if (!tab) return null;
            const isFocused = state.index === index;
            const color = isFocused ? accent : palette.textTertiary;

            return (
              <Pressable
                key={route.key}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name as never);
                  }
                }}
                style={{
                  flex: 1,
                  height: 70,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    width: 40,
                    height: 2,
                    backgroundColor: isFocused ? accent : 'transparent',
                    position: 'absolute',
                    top: 0,
                  }}
                />
                <Feather name={tab.icon} size={20} color={color} />
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '500',
                    color,
                    marginTop: 4,
                  }}>
                  {t(`tabs.${tab.key}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}>
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: t(`tabs.${tab.key}`) }} />
      ))}
    </Tabs>
  );
}
