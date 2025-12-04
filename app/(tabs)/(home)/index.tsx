
import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HomeMenuItem } from '@/components/HomeMenuItem';

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
        {/* Illustration Block */}
        <View style={styles.illustrationCard}>
          <Image
            source={require('@/assets/images/ed920307-19f7-48d1-96f4-53ed71f8af30.jpeg')}
            style={styles.familyImage}
            resizeMode="contain"
          />
        </View>

        {/* Menu Items */}
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
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 12,
    paddingBottom: 120,
    alignItems: 'stretch',
  },
  illustrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
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
