
import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  Text,
  Animated,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { colors } from "@/styles/commonStyles";
import { useFamily } from "@/contexts/FamilyContext";

const DAILY_MESSAGES = [
  "Elke dag is een nieuwe kans.",
  "Rust en overzicht voor vandaag.",
  "Samen houden we het overzichtelijk.",
  "Je hoeft niet alles tegelijk.",
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

interface DashboardCardProps {
  title: string;
  icon: string;
  subtitle: string;
  route: string;
  backgroundColor: string;
  textColor: string;
  iconColor: string;
}

function DashboardCard({
  title,
  icon,
  subtitle,
  route,
  backgroundColor,
  textColor,
  iconColor,
}: DashboardCardProps) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
    router.push(route as any);
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor }]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={28}
          color={iconColor}
          style={styles.cardIcon}
        />
        <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.cardSubtitle, { color: textColor, opacity: 0.8 }]}>
          {subtitle}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentUser } = useFamily();

  // Extract first name from user profile, fallback to empty string
  const firstName = currentUser?.name?.split(" ")[0]?.trim() || "";
  const greeting = getGreeting();
  const dailyMessage = getDailyMessage();

  // Build greeting text with personalization
  const greetingText = firstName ? `${greeting}, ${firstName}!` : `${greeting}!`;

  // Dashboard cards with specific color scheme
  // Row 1: Agenda (ORANGE), Taken (BEIGE)
  // Row 2: Boodschappen (BEIGE), Financiën (ORANGE)
  // Row 3: Contactboek (ORANGE), Fotoboek (BEIGE)
  const dashboardCards = [
    // Row 1 - Left: Agenda (ORANGE)
    {
      title: t("home.menu.agenda"),
      icon: "calendar-month-outline",
      subtitle: "Vandaag: 2 afspraken",
      route: "/agenda",
      backgroundColor: "#f08a48", // Flow Fam oranje
      textColor: "#FFFFFF",
      iconColor: "#FFFFFF",
    },
    // Row 1 - Right: Taken (BEIGE)
    {
      title: "Taken",
      icon: "calendar-check-outline",
      subtitle: "Open: 5",
      route: "/adult-tasks",
      backgroundColor: "#f4eae1", // Flow Fam beige
      textColor: "#4c3b34",
      iconColor: "#4c3b34",
    },
    // Row 2 - Left: Boodschappen (BEIGE)
    {
      title: t("home.menu.shopping"),
      icon: "cart-outline",
      subtitle: "Nodig: Melk, Brood",
      route: "/shopping",
      backgroundColor: "#f4eae1", // Flow Fam beige
      textColor: "#4c3b34",
      iconColor: "#4c3b34",
    },
    // Row 2 - Right: Financiën (ORANGE)
    {
      title: t("home.menu.finances"),
      icon: "currency-eur",
      subtitle: "Deze week bijgewerkt",
      route: "/finances",
      backgroundColor: "#f08a48", // Flow Fam oranje
      textColor: "#FFFFFF",
      iconColor: "#FFFFFF",
    },
    // Row 3 - Left: Contactboek (ORANGE)
    {
      title: t("home.menu.contactbook"),
      icon: "book-outline",
      subtitle: "Verjaardag: Jan (morgen)",
      route: "/contactbook",
      backgroundColor: "#f08a48", // Flow Fam oranje
      textColor: "#FFFFFF",
      iconColor: "#FFFFFF",
    },
    // Row 3 - Right: Fotoboek (BEIGE)
    {
      title: t("home.menu.photobook"),
      icon: "camera-outline",
      subtitle: "Laatste update: week 40",
      route: "/memories",
      backgroundColor: "#f4eae1", // Flow Fam beige
      textColor: "#4c3b34",
      iconColor: "#4c3b34",
    },
  ];

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Header */}
          <View style={styles.headerSection}>
            <Text style={styles.greetingText}>{greetingText}</Text>
            <Text style={styles.dailyMessage}>{dailyMessage}</Text>
          </View>

          {/* Dashboard Grid */}
          <View style={styles.gridContainer}>
            {dashboardCards.map((card, index) => (
              <React.Fragment key={index}>
                <DashboardCard
                  title={card.title}
                  icon={card.icon}
                  subtitle={card.subtitle}
                  route={card.route}
                  backgroundColor={card.backgroundColor}
                  textColor={card.textColor}
                  iconColor={card.iconColor}
                />
              </React.Fragment>
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
  headerSection: {
    marginBottom: 32,
    marginTop: 24, // ✅ Increased from 8 to 24 (+16px extra spacing)
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4c3b34",
    fontFamily: "Poppins_700Bold",
    marginBottom: 8,
  },
  dailyMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4c3b34",
    opacity: 0.7,
    fontFamily: "Nunito_400Regular",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: "48%",
  },
  card: {
    borderRadius: 20,
    padding: 16,
    minHeight: 140,
    justifyContent: "flex-start",
    ...Platform.select({
      ios: {
        shadowColor: "#4c3b34",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0px 2px 12px rgba(76, 59, 52, 0.08)",
      },
    }),
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Nunito_400Regular",
  },
});
