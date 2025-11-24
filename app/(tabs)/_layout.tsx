
import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';

export default function TabLayout() {
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
    </View>
  );
}
