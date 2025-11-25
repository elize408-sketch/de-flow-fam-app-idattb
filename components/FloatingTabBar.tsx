
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import { useTheme } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { useFamily } from '@/contexts/FamilyContext';
import { getTabsForRole } from '@/utils/tabFilters';

const { width: screenWidth } = Dimensions.get('window');

export interface TabBarItem {
  name: string;
  route: Href;
  icon: keyof typeof MaterialIcons.glyphMap | 'custom-toothbrush' | 'custom-euro';
  label: string;
}

interface FloatingTabBarProps {
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  containerWidth = screenWidth * 0.95,
  borderRadius = 16,
  bottomMargin
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const animatedValue = useSharedValue(0);
  const { currentUser } = useFamily();

  // Get tabs based on current user role
  const tabs = React.useMemo(() => {
    if (!currentUser) {
      // Default to parent tabs if no user selected
      return getTabsForRole('parent');
    }
    return getTabsForRole(currentUser.role);
  }, [currentUser]);

  const activeTabIndex = React.useMemo(() => {
    let bestMatch = -1;
    let bestMatchScore = 0;

    tabs.forEach((tab, index) => {
      let score = 0;

      if (pathname === tab.route) {
        score = 100;
      } else if (pathname.startsWith(tab.route as string)) {
        score = 80;
      } else if (pathname.includes(tab.name)) {
        score = 60;
      } else if (tab.route.includes('/(tabs)/') && pathname.includes(tab.route.split('/(tabs)/')[1])) {
        score = 40;
      }

      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = index;
      }
    });

    return bestMatch >= 0 ? bestMatch : 0;
  }, [pathname, tabs]);

  React.useEffect(() => {
    if (activeTabIndex >= 0) {
      animatedValue.value = withSpring(activeTabIndex, {
        damping: 20,
        stiffness: 120,
        mass: 1,
      });
    }
  }, [activeTabIndex, animatedValue]);

  const handleTabPress = (route: Href) => {
    router.push(route);
  };

  // Determine layout based on number of tabs
  const needsGridLayout = tabs.length > 5;
  const tabsPerRow = needsGridLayout ? 3 : tabs.length;
  const tabWidthPercent = needsGridLayout ? 33.33 : ((100 / tabs.length) - 1);

  const indicatorStyle = useAnimatedStyle(() => {
    if (needsGridLayout) {
      return { opacity: 0 };
    }
    const tabWidth = (containerWidth - 8) / tabs.length;
    return {
      transform: [
        {
          translateX: interpolate(
            animatedValue.value,
            [0, tabs.length - 1],
            [0, tabWidth * (tabs.length - 1)]
          ),
        },
      ],
    };
  });

  const dynamicStyles = {
    blurContainer: {
      ...styles.blurContainer,
      borderWidth: 2,
      borderColor: colors.vibrantOrange,
      ...Platform.select({
        ios: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
        android: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        },
        web: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        },
      }),
    },
    background: {
      ...styles.background,
    },
    indicator: {
      ...styles.indicator,
      backgroundColor: colors.vibrantOrange,
      width: `${tabWidthPercent}%` as `${number}%`,
      borderRadius: 50,
      height: 52,
    },
  };

  const renderIcon = (tab: TabBarItem, isActive: boolean) => {
    const iconColor = isActive ? (needsGridLayout ? colors.vibrantOrange : colors.card) : colors.text;
    
    if (tab.icon === 'custom-toothbrush') {
      return (
        <Image
          source={require('@/assets/images/37e069f3-3725-4165-ba07-912d50e9b6e8.png')}
          style={[
            styles.customIcon,
            { tintColor: iconColor }
          ]}
          resizeMode="contain"
        />
      );
    }
    
    if (tab.icon === 'custom-euro') {
      return (
        <Image
          source={require('@/assets/images/ef024723-5af7-4fad-8bd5-12b97c4294d7.png')}
          style={[
            styles.customIcon,
            { tintColor: iconColor }
          ]}
          resizeMode="contain"
        />
      );
    }
    
    return (
      <IconSymbol
        android_material_icon_name={tab.icon as any}
        ios_icon_name={tab.icon}
        size={24}
        color={iconColor}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[
        styles.container,
        {
          width: containerWidth,
          marginBottom: bottomMargin ?? 20
        }
      ]}>
        <BlurView
          intensity={80}
          style={[dynamicStyles.blurContainer, { borderRadius }]}
        >
          <View style={dynamicStyles.background} />
          {!needsGridLayout && <Animated.View style={[dynamicStyles.indicator, indicatorStyle]} />}
          <View style={[
            styles.tabsContainer,
            needsGridLayout && styles.tabsContainerGrid
          ]}>
            {tabs.map((tab, index) => {
              const isActive = activeTabIndex === index;

              return (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      needsGridLayout && styles.tabGrid,
                      isActive && needsGridLayout && styles.tabGridActive
                    ]}
                    onPress={() => handleTabPress(tab.route)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tabContent}>
                      {renderIcon(tab, isActive)}
                      <Text
                        style={[
                          styles.tabLabel,
                          needsGridLayout && styles.tabLabelGrid,
                          { color: colors.text },
                          isActive && !needsGridLayout && { color: colors.card, fontWeight: '700' },
                          isActive && needsGridLayout && { color: colors.vibrantOrange, fontWeight: '700' },
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {tab.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  container: {
    marginHorizontal: 10,
    alignSelf: 'center',
  },
  blurContainer: {
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 2,
    bottom: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tabsContainerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 'auto',
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    gap: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabGrid: {
    flex: 0,
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 75,
    borderRadius: 12,
  },
  tabGridActive: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingHorizontal: 4,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  tabLabelGrid: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
  },
  customIcon: {
    width: 24,
    height: 24,
  },
});
