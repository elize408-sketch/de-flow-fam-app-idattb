
import { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';
import { Href } from 'expo-router';

export function getTabsForRole(role: 'parent' | 'child'): TabBarItem[] {
  // All tabs for parents
  const parentTabs: TabBarItem[] = [
    { name: 'home', route: '/(tabs)/(home)' as Href, icon: 'home', label: 'Home' },
    { name: 'agenda', route: '/(tabs)/agenda' as Href, icon: 'calendar-today', label: 'Agenda' },
    { name: 'tasks', route: '/(tabs)/tasks' as Href, icon: 'check-circle', label: 'Taken' },
    { name: 'shopping', route: '/(tabs)/shopping' as Href, icon: 'list', label: 'Boodschappen' },
    { name: 'finances', route: '/(tabs)/finances' as Href, icon: 'custom-euro', label: 'Financiën' },
    { name: 'reminders', route: '/(tabs)/reminders' as Href, icon: 'notifications', label: 'Herinneringen' },
    { name: 'meals', route: '/(tabs)/meals' as Href, icon: 'restaurant', label: 'Maaltijden' },
    { name: 'notes', route: '/(tabs)/notes' as Href, icon: 'folder', label: 'Notities' },
    { name: 'shop', route: '/(tabs)/shop' as Href, icon: 'shopping-bag', label: 'Shop' },
    { name: 'profile', route: '/(tabs)/profile' as Href, icon: 'settings', label: 'Profiel' },
  ];

  // Limited tabs for children: only Profile, Tasks, and Agenda
  const childTabs: TabBarItem[] = [
    { name: 'home', route: '/(tabs)/(home)' as Href, icon: 'home', label: 'Home' },
    { name: 'agenda', route: '/(tabs)/agenda' as Href, icon: 'calendar-today', label: 'Agenda' },
    { name: 'tasks', route: '/(tabs)/tasks' as Href, icon: 'check-circle', label: 'Taken' },
    { name: 'profile', route: '/(tabs)/profile' as Href, icon: 'settings', label: 'Profiel' },
  ];

  return role === 'parent' ? parentTabs : childTabs;
}
