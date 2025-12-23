import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import FloatingTabBar from "@/components/FloatingTabBar";

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
        }}
      >
        <Stack.Screen name="(home)" options={{ headerShown: false }} />

        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="child" options={{ headerShown: false }} />
        <Stack.Screen name="child-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />

        <Stack.Screen name="tasks" options={{ headerShown: false }} />
        <Stack.Screen name="adult-tasks" options={{ headerShown: false }} />
        <Stack.Screen name="rewards" options={{ headerShown: false }} />
        <Stack.Screen name="agenda" options={{ headerShown: false }} />
        <Stack.Screen name="household" options={{ headerShown: false }} />
        <Stack.Screen name="meals" options={{ headerShown: false }} />
        <Stack.Screen name="finances" options={{ headerShown: false }} />
        <Stack.Screen name="shopping" options={{ headerShown: false }} />
        <Stack.Screen name="notes" options={{ headerShown: false }} />
        <Stack.Screen name="documents" options={{ headerShown: false }} />
        <Stack.Screen name="memories" options={{ headerShown: false }} />
        <Stack.Screen name="reminders" options={{ headerShown: false }} />
        <Stack.Screen name="shop" options={{ headerShown: false }} />

        {/* ✅ Deze miste je */}
        <Stack.Screen name="contactbook" options={{ headerShown: false }} />
        <Stack.Screen name="roosters" options={{ headerShown: false }} />
      </Stack>

      {/* ✅ Heel belangrijk: laat de tabbar GEEN touches “stelen” van de rest */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <FloatingTabBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
