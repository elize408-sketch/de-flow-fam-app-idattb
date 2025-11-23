
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { FamilyProvider } from '@/contexts/FamilyContext';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'tasks',
      route: '/(tabs)/tasks',
      icon: 'check-circle',
      label: 'Taken',
    },
    {
      name: 'meals',
      route: '/(tabs)/meals',
      icon: 'restaurant',
      label: 'Maaltijden',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'settings',
      label: 'Instellingen',
    },
  ];

  return (
    <FamilyProvider>
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
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </FamilyProvider>
  );
}
