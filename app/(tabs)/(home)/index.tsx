
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
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { HomeMenuItem } from "@/components/HomeMenuItem";
import { colors } from "@/styles/commonStyles";
import { useFamily } from "@/contexts/FamilyContext";

const DAILY_MESSAGES = [
  "Elke dag is een nieuwe kans.",
  "Rust in je hoofd begint hier.",
  "Je hoeft het niet perfect te doen.",
  "Samen maken we het overzichtelijk.",
  "Kleine stappen zijn ook vooruitgang.",
  "Vandaag mag licht zijn.",
  "Je doet het goed.",
  "Alles op zijn tijd.",
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
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Wave only once when component mounts
    if (!hasAnimated.current) {
      hasAnimated.current = true;
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
      ]).start();
    }
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
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#f08a48", "#FFFFFF"]}
        locations={[0, 0.3]}
        style={styles.headerGradient}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeCard}>
            <View style={styles.orangeAccent} />
            <View style={styles.welcomeContent}>
              <View style={styles.greetingRow}>
                <Text style={styles.greetingText}>
                  {greeting},{" "}
                  <Text style={styles.firstNameText}>{firstName}</Text>
                </Text>
                <WavingHand />
              </View>
              <Text style={styles.dailyMessage}>{dailyMessage}</Text>
            </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    opacity: 0.4,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 48 : 12,
    paddingBottom: 120,
  },
  welcomeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    marginTop: 8,
    flexDirection: "row",
    ...Platform.select({
      ios: {
        shadowColor: colors.darkBrown,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: `0px 2px 16px rgba(76, 59, 52, 0.06)`,
      },
    }),
  },
  orangeAccent: {
    width: 4,
    backgroundColor: "#f08a48",
    borderRadius: 2,
    marginRight: 16,
  },
  welcomeContent: {
    flex: 1,
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
  firstNameText: {
    color: "#f08a48",
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
