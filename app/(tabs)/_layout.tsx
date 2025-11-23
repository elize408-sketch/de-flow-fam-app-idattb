
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
      name: 'rewards',
      route: '/(tabs)/rewards',
      icon: 'star',
      label: 'Beloningen',
    },
    {
      name: 'agenda',
      route: '/(tabs)/agenda',
      icon: 'calendar-today',
      label: 'Agenda',
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
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </FamilyProvider>
  );
}
