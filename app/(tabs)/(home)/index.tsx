
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
import { useTranslation } from 'react-i18next';
import { HomeMenuItem } from '@/components/HomeMenuItem';
import { colors } from '@/styles/commonStyles';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const menuItems = [
    {
      title: t('home.menu.agenda'),
      color: '#4A90E2',
      icon: 'calendar-month-outline',
      route: '/(tabs)/agenda',
    },
    {
      title: t('home.menu.tasks'),
      color: '#7ED321',
      icon: 'check-circle-outline',
      route: '/(tabs)/tasks',
    },
    {
      title: t('home.menu.shopping'),
      color: colors.warmOrange,
      icon: 'cart-outline',
      route: '/(tabs)/shopping',
    },
    {
      title: t('home.menu.finances'),
      color: '#34C759',
      icon: 'currency-eur',
      route: '/(tabs)/finances',
    },
    {
      title: t('home.menu.photobook'),
      color: colors.redPink,
      icon: 'camera-outline',
      route: '/(tabs)/memories',
    },
    {
      title: t('home.menu.meals'),
      color: colors.warmOrange,
      icon: 'food-outline',
      route: '/(tabs)/meals',
    },
    {
      title: 'Contactboek',
      color: '#9B59B6',
      icon: 'book-outline',
      route: '/(tabs)/contactbook',
    },
    {
      title: t('home.menu.shop'),
      color: colors.redPink,
      icon: 'shopping-outline',
      route: '/(tabs)/shop',
    },
  ];

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
        shadowColor: colors.darkBrown,
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
