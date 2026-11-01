import React, { useEffect, useState } from 'react';
import { AppState, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BudgetProvider } from '../store';
import LockScreen from '../screens/LockScreen';
import { C } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const icon = (on: IconName, off: IconName) =>
  function TabIcon({ color, size, focused }: { color: string; size: number; focused: boolean }) {
    return <Ionicons name={focused ? on : off} size={size} color={color} />;
  };

export default function Layout() {
  const [locked, setLocked] = useState(true);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background') setLocked(true);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    try {
      NavigationBar.setBackgroundColorAsync(C.bg).catch(() => {});
      NavigationBar.setButtonStyleAsync('light').catch(() => {});
    } catch {}
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <BudgetProvider>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { backgroundColor: C.bg, borderTopColor: C.line },
              tabBarActiveTintColor: C.blueLight,
              tabBarInactiveTintColor: C.mute,
            }}
          >
            <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home', 'home-outline') }} />
            <Tabs.Screen name="budget" options={{ title: 'Budget', tabBarIcon: icon('wallet', 'wallet-outline') }} />
            <Tabs.Screen name="stats" options={{ title: 'Stats', tabBarIcon: icon('stats-chart', 'stats-chart-outline') }} />
            <Tabs.Screen name="activity" options={{ href: null }} />
          </Tabs>
        </BudgetProvider>
        {locked && (
          <View style={StyleSheet.absoluteFill}>
            <LockScreen onUnlock={() => setLocked(false)} />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}
