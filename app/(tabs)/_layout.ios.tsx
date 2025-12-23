
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="notifications" name="notifications">
        <Icon sf="bell.fill" />
        <Label>Notificaties</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="child" name="child">
        <Icon sf="figure.2.and.child.holdinghands" />
        <Label>Kind</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="settings" name="settings">
        <Icon sf="gearshape.fill" />
        <Label>Instellingen</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
