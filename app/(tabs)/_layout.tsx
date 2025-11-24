
import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useFamily } from '@/contexts/FamilyContext';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const { currentUser } = useFamily();
  const isParent = currentUser?.role === 'parent';

  // Define tabs based on user role
  const parentTabs: TabBarItem[] = [
    { name: 'home', route: '/(tabs)/(home)', icon: 'home', label: 'Home' },
    { name: 'agenda', route: '/(tabs)/agenda', icon: 'calendar-today', label: 'Agenda' },
    { name: 'tasks', route: '/(tabs)/tasks', icon: 'check-circle', label: 'Taken' },
    { name: 'shopping', route: '/(tabs)/shopping', icon: 'list', label: 'Boodschappen' },
    { name: 'finances', route: '/(tabs)/finances', icon: 'custom-euro', label: 'Financiën' },
    { name: 'reminders', route: '/(tabs)/reminders', icon: 'notifications', label: 'Herinneringen' },
    { name: 'meals', route: '/(tabs)/meals', icon: 'restaurant', label: 'Maaltijden' },
    { name: 'notes', route: '/(tabs)/notes', icon: 'folder', label: 'Notities' },
    { name: 'shop', route: '/(tabs)/shop', icon: 'shopping-bag', label: 'Shop' },
    { name: 'profile', route: '/(tabs)/profile', icon: 'settings', label: 'Menu' },
  ];

  const childTabs: TabBarItem[] = [
    { name: 'home', route: '/(tabs)/(home)', icon: 'home', label: 'Home' },
    { name: 'tasks', route: '/(tabs)/tasks', icon: 'check-circle', label: 'Taken' },
    { name: 'rewards', route: '/(tabs)/rewards', icon: 'star', label: 'Beloningen' },
    { name: 'agenda', route: '/(tabs)/agenda', icon: 'calendar-today', label: 'Agenda' },
    { name: 'profile', route: '/(tabs)/profile', icon: 'settings', label: 'Menu' },
  ];

  const tabs = isParent ? parentTabs : childTabs;

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="tasks" name="tasks" />
        <Stack.Screen key="rewards" name="rewards" />
        <Stack.Screen key="agenda" name="agenda" />
        <Stack.Screen key="household" name="household" />
        <Stack.Screen key="meals" name="meals" />
        <Stack.Screen key="finances" name="finances" />
        <Stack.Screen key="shopping" name="shopping" />
        <Stack.Screen key="notes" name="notes" />
        <Stack.Screen key="memories" name="memories" />
        <Stack.Screen key="reminders" name="reminders" />
        <Stack.Screen key="shop" name="shop" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </View>
  );
}
