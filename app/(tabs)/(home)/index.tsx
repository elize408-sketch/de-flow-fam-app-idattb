
import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  Text,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { HomeMenuItem } from "@/components/HomeMenuItem";
import { colors } from "@/styles/commonStyles";
import { useFamily } from "@/contexts/FamilyContext";

const DAILY_MESSAGES = [
  "Vandaag hoeft niet perfect te zijn.",
  "Kleine stappen maken ook vooruitgang.",
  "Alles wat je vandaag doet, is genoeg.",
  "Rust in je hoofd begint met overzicht.",
  "Je doet het geweldig.",
  "Elke dag is een nieuwe kans.",
  "Samen maken we het verschil.",
  "Geniet van de kleine momenten.",
];

function getDailyMessage(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_MESSAGES[dayOfYear % DAILY_MESSAGES.length];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

function WavingHand() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: -1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(animate, 3000);
      });
    };

    animate();
  }, [rotation]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-20deg", "20deg"],
  });

  return (
    <Animated.Text
      style={[
        styles.wavingHand,
        { transform: [{ rotate: rotateInterpolate }] },
      ]}
    >
      👋
    </Animated.Text>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const { currentUser } = useFamily();

  const firstName = currentUser?.name?.split(" ")[0] || "daar";
  const greeting = getGreeting();
  const dailyMessage = getDailyMessage();

  const menuItems = [
    {
      title: t("home.menu.agenda"),
      icon: "calendar-month-outline",
      route: "/(tabs)/agenda",
    },
    {
      title: "Taken",
      icon: "calendar-check-outline",
      route: "/(tabs)/adult-tasks",
    },
    {
      title: t("home.menu.shopping"),
      icon: "cart-outline",
      route: "/(tabs)/shopping",
    },
    {
      title: t("home.menu.finances"),
      icon: "currency-eur",
      route: "/(tabs)/finances",
    },
    {
      title: t("home.menu.meals"),
      icon: "food-outline",
      route: "/(tabs)/meals",
    },
    {
      title: t("home.menu.photobook"),
      icon: "camera-outline",
      route: "/(tabs)/memories",
    },
    {
      title: t("home.menu.contactbook"),
      icon: "book-outline",
      route: "/(tabs)/contactbook",
    },
    {
      title: t("home.menu.roosters"),
      icon: "calendar-clock",
      route: "/(tabs)/roosters",
    },
    {
      title: t("home.menu.shop"),
      icon: "shopping-outline",
      route: "/(tabs)/shop",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeCard}>
          <View style={styles.greetingRow}>
            <Text style={styles.greetingText}>
              {greeting}, {firstName}
            </Text>
            <WavingHand />
          </View>
          <Text style={styles.dailyMessage}>{dailyMessage}</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <HomeMenuItem
              key={item.route}
              title={item.title}
              icon={item.icon}
              route={item.route}
              index={index}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 48 : 12,
    paddingBottom: 120,
  },
  welcomeCard: {
    backgroundColor: "#f4eae1",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.darkBrown,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: `0px 2px 12px rgba(76, 59, 52, 0.08)`,
      },
    }),
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4c3b34",
    fontFamily: "Poppins_700Bold",
    marginRight: 8,
  },
  wavingHand: {
    fontSize: 24,
  },
  dailyMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4c3b34",
    fontFamily: "Nunito_400Regular",
  },
  menuContainer: {
    gap: 8,
  },
});
