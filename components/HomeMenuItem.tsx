import React, { useRef } from "react";
import { TouchableOpacity, Text, StyleSheet, Animated, View, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface HomeMenuItemProps {
  title: string;
  color: string;
  icon: string;

  /**
   * Je mag óf onPress meegeven, óf route.
   * Als beide bestaan, wint onPress.
   */
  onPress?: () => void;
  route?: string;
}

function normalizeRoute(route: string) {
  // Expo Router kan soms beter overweg met routes zonder "/(tabs)"
  // Dus: "/(tabs)/agenda" -> "/agenda"
  if (!route) return "/";
  return route.startsWith("/(tabs)/") ? route.replace("/(tabs)", "") : route;
}

export function HomeMenuItem({ title, color, icon, onPress, route }: HomeMenuItemProps) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
    // 1) Als jij onPress meegeeft vanuit home: gebruik die
    if (onPress) {
      onPress();
      return;
    }

    // 2) Anders: navigeer op basis van route
    if (route) {
      const to = normalizeRoute(route);
      router.push(to as any);
      return;
    }

    // 3) Niets meegekregen -> niks doen (maar nu weet je wél waarom)
    console.warn(`[HomeMenuItem] Geen onPress of route voor: ${title}`);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: color }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.contentWrapper}>
          <MaterialCommunityIcons name={icon as any} size={26} color="#FFFFFF" />
          <Text style={styles.title}>{title}</Text>
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
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)" as any,
      },
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
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
    flex: 1,
    letterSpacing: 0.3,
  },
});
