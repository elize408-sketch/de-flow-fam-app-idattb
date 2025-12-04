
import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Platform,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { HomeMenuItem } from '@/components/HomeMenuItem';
import { useFamily } from '@/contexts/FamilyContext';
import { colors } from '@/styles/commonStyles';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentUser, reloadCurrentUser } = useFamily();

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
        {/* User Info Banner */}
        {currentUser && (
          <View style={styles.userBanner}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {t('home.greeting', { name: currentUser.name })}
              </Text>
              <Text style={styles.userRole}>
                {currentUser.role === 'parent' ? t('home.parent') : t('home.child')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={reloadCurrentUser}
            >
              <Text style={styles.refreshButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>
        )}

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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 12,
    paddingBottom: 120,
    alignItems: 'stretch',
  },
  userBanner: {
    backgroundColor: colors.softCream,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.redPink,
    ...Platform.select({
      ios: {
        shadowColor: colors.darkBrown,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: `0px 2px 12px ${colors.shadow}`,
      },
    }),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkBrown,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 20,
  },
  illustrationCard: {
    backgroundColor: colors.card,
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
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: `0px 2px 12px ${colors.shadow}`,
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
