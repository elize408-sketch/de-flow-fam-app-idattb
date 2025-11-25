
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { useFamily } from '@/contexts/FamilyContext';

export default function TabLayout() {
  const { currentUser } = useFamily();
  const isParent = currentUser?.role === 'parent';

  if (isParent) {
    // Parents see all tabs
    return (
      <NativeTabs>
        <NativeTabs.Trigger key="home" name="(home)">
          <Icon sf="house.fill" />
          <Label>Home</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="agenda" name="agenda">
          <Icon sf="calendar" />
          <Label>Agenda</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="tasks" name="tasks">
          <Icon sf="checkmark.circle.fill" />
          <Label>Taken</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="shopping" name="shopping">
          <Icon sf="list.bullet" />
          <Label>Boodschappen</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="finances" name="finances">
          <Icon sf="eurosign.circle.fill" />
          <Label>Financiën</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="reminders" name="reminders">
          <Icon sf="bell.fill" />
          <Label>Herinneringen</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="meals" name="meals">
          <Icon sf="fork.knife" />
          <Label>Maaltijden</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="notes" name="notes">
          <Icon sf="folder.fill" />
          <Label>Notities</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="shop" name="shop">
          <Icon sf="bag.fill" />
          <Label>Shop</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="profile" name="profile">
          <Icon sf="person.fill" />
          <Label>Profiel</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // Children only see: Home and Profile
  return (
    <NativeTabs>
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon sf="person.fill" />
        <Label>Profiel</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
