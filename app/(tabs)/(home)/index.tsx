
import React from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { HomeMenuItem } from "@/components/HomeMenuItem";
import { colors } from "@/styles/commonStyles";

export default function HomeScreen() {
  const { t } = useTranslation();

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
        <View style={styles.illustrationCard}>
          <Image
            source={require("@/assets/images/ed920307-19f7-48d1-96f4-53ed71f8af30.jpeg")}
            style={styles.familyImage}
            resizeMode="contain"
          />
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
    backgroundColor: colors.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 48 : 12,
    paddingBottom: 120,
  },
  illustrationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 8,
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
  familyImage: {
    width: 260,
    height: 160,
  },
  menuContainer: {
    gap: 8,
  },
});
