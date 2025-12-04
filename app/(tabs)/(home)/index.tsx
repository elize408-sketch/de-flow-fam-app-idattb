
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HomeMenuItem } from '@/components/HomeMenuItem';
import { colors } from '@/styles/commonStyles';

const menuItems = [
  {
    title: 'Agenda',
    color: '#3A8DFF',
    icon: 'calendar-month-outline',
    route: '/(tabs)/agenda',
  },
  {
    title: 'Taken',
    color: '#4CAF50',
    icon: 'check-circle-outline',
    route: '/(tabs)/tasks',
  },
  {
    title: 'Boodschappen',
    color: '#FFB74D',
    icon: 'cart-outline',
    route: '/(tabs)/shopping',
  },
  {
    title: 'Financiën',
    color: '#7ED957',
    icon: 'currency-eur',
    route: '/(tabs)/finances',
  },
  {
    title: 'Herinneringen',
    color: '#FF8A65',
    icon: 'bell-outline',
    route: '/(tabs)/reminders',
  },
  {
    title: 'Maaltijden',
    color: '#29B6F6',
    icon: 'food-outline',
    route: '/(tabs)/meals',
  },
  {
    title: 'Shop',
    color: '#AB47BC',
    icon: 'shopping-outline',
    route: '/(tabs)/shop',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image
            source={require('@/assets/images/ff16279a-fb4e-41ec-9013-daf7a31fa2fb.png')}
            style={styles.familyImage}
            resizeMode="contain"
          />
          <View style={styles.titlePill}>
            <Text style={styles.title}>Flow Fam</Text>
          </View>
          <Text style={styles.subtitle}>Rust. Overzicht. Liefde.</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <HomeMenuItem
                title={item.title}
                color={item.color}
                icon={item.icon}
                onPress={() => router.push(item.route as any)}
              />
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 140,
    alignItems: 'stretch',
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 16,
  },
  familyImage: {
    width: 180,
    height: 120,
    marginBottom: 16,
  },
  titlePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 30,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
    elevation: 4,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF8A3C',
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  menuContainer: {
    gap: 14,
  },
});
