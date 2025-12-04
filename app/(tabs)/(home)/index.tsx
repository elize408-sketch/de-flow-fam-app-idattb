
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HomeMenuItem } from '@/components/HomeMenuItem';
import { colors } from '@/styles/commonStyles';

const menuItems = [
  {
    title: 'Agenda',
    color: '#4DA3FF',
    icon: 'calendar-month-outline',
    route: '/(tabs)/agenda',
  },
  {
    title: 'Tasks',
    color: '#5ECC4B',
    icon: 'check-circle-outline',
    route: '/(tabs)/tasks',
  },
  {
    title: 'Groceries',
    color: '#F6A623',
    icon: 'cart-outline',
    route: '/(tabs)/shopping',
  },
  {
    title: 'Finances',
    color: '#6CCF5A',
    icon: 'cash-outline',
    route: '/(tabs)/finances',
  },
  {
    title: 'Reminders',
    color: '#A65DFF',
    icon: 'bell-outline',
    route: '/(tabs)/reminders',
  },
  {
    title: 'Meals',
    color: '#FF76A8',
    icon: 'food-outline',
    route: '/(tabs)/meals',
  },
  {
    title: 'Notes',
    color: '#EBB156',
    icon: 'notebook-outline',
    route: '/(tabs)/notes',
  },
  {
    title: 'Shop',
    color: '#5EDBC8',
    icon: 'shopping-outline',
    route: '/(tabs)/shop',
  },
  {
    title: 'Profile',
    color: '#7A7A7A',
    icon: 'account-circle-outline',
    route: '/(tabs)/profile',
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
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Flow Fam</Text>
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 140,
    alignItems: 'stretch',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
  menuContainer: {
    gap: 12,
  },
});
