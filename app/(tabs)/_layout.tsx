
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { useFamily } from '@/contexts/FamilyContext';

export default function TabLayout() {
  const { currentUser } = useFamily();
  const isParent = currentUser?.role === 'parent';

  // Parent tabs - full menu with all options including tasks
  const parentTabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'agenda',
      route: '/(tabs)/agenda',
      icon: 'calendar-today',
      label: 'Agenda',
    },
    {
      name: 'tasks',
      route: '/(tabs)/tasks',
      icon: 'check-circle',
      label: 'Taken',
    },
    {
      name: 'household',
      route: '/(tabs)/household',
      icon: 'home-repair-service',
      label: 'Huishouden',
    },
    {
      name: 'meals',
      route: '/(tabs)/meals',
      icon: 'restaurant',
      label: 'Maaltijden',
    },
    {
      name: 'finances',
      route: '/(tabs)/finances',
      icon: 'custom-euro',
      label: 'Financiën',
    },
    {
      name: 'shopping',
      route: '/(tabs)/shopping',
      icon: 'shopping-cart',
      label: 'Boodschappen',
    },
    {
      name: 'notes',
      route: '/(tabs)/notes',
      icon: 'note',
      label: 'Notities',
    },
    {
      name: 'memories',
      route: '/(tabs)/memories',
      icon: 'photo-library',
      label: 'Herinneringen',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'settings',
      label: 'Instellingen',
    },
  ];

  // Child tabs - simplified menu
  const childTabs: TabBarItem[] = [
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
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'settings',
      label: 'Instellingen',
    },
  ];

  const tabs = isParent ? parentTabs : childTabs;

  return (
    <>
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
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
