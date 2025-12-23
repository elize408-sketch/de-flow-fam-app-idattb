
import React, { useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface HomeMenuItemProps {
  title: string;
  icon: string;
  route?: string;
  onPress?: () => void;
  index: number;
}

function normalizeRoute(route: string) {
  if (!route) return "/";
  return route.startsWith("/(tabs)/") ? route.replace("/(tabs)", "") : route;
}

export function HomeMenuItem({ title, icon, route, onPress, index }: HomeMenuItemProps) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Alternate between two color schemes
  const isStyleA = index % 2 === 0;
  const backgroundColor = isStyleA ? "#cfa692" : "#f4eae1";
  const textColor = isStyleA ? "#FFFFFF" : "#4c3b34";
  const iconColor = isStyleA ? "#FFFFFF" : "#4c3b34";

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (route) {
      const to = normalizeRoute(route);
      router.navigate(to as any);
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.container, { backgroundColor }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.contentWrapper}>
          <MaterialCommunityIcons name={icon as any} size={26} color={iconColor} />
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)" as any },
    }),
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
    flex: 1,
    letterSpacing: 0.3,
  },
});
