
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Href } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const FLOW_FAM_ORANGE = '#F28F45';
const INACTIVE_GREY = '#A0A0A0';

export interface TabBarItem {
  name: string;
  route: Href;
  iosIcon: string;
  androidIcon: string;
  label: string;
}

interface FloatingTabBarProps {
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

const tabs: TabBarItem[] = [
  {
    name: 'home',
    route: '/(tabs)/(home)',
    iosIcon: 'house.fill',
    androidIcon: 'home',
    label: 'Home',
  },
  {
    name: 'notifications',
    route: '/(tabs)/notifications',
    iosIcon: 'bell.fill',
    androidIcon: 'notifications',
    label: 'Notificaties',
  },
  {
    name: 'child',
    route: '/(tabs)/child',
    iosIcon: 'person.fill',
    androidIcon: 'child-care',
    label: 'Kind',
  },
  {
    name: 'settings',
    route: '/(tabs)/settings',
    iosIcon: 'gearshape.fill',
    androidIcon: 'settings',
    label: 'Instellingen',
  },
];

export default function FloatingTabBar({
  containerWidth = screenWidth * 0.95,
  borderRadius = 16,
  bottomMargin = 20,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const animatedValue = useSharedValue(0);

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
      }

      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = index;
      }
    });

    return bestMatch >= 0 ? bestMatch : 0;
  }, [pathname]);

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

  const tabWidth = (containerWidth - 8) / tabs.length;

  const indicatorStyle = useAnimatedStyle(() => {
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
    indicator: {
      ...styles.indicator,
      backgroundColor: FLOW_FAM_ORANGE,
      width: tabWidth,
      borderRadius: 50,
      height: 52,
    },
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View
        style={[
          styles.container,
          {
            width: containerWidth,
            marginBottom: bottomMargin,
          },
        ]}
      >
        <BlurView
          intensity={80}
          style={[dynamicStyles.blurContainer, { borderRadius }]}
        >
          <View style={styles.background} />
          <Animated.View style={[dynamicStyles.indicator, indicatorStyle]} />
          <View style={styles.tabsContainer}>
            {tabs.map((tab, index) => {
              const isActive = activeTabIndex === index;
              const iconColor = isActive ? '#FFFFFF' : INACTIVE_GREY;
              const labelColor = isActive ? '#FFFFFF' : INACTIVE_GREY;

              return (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={styles.tab}
                    onPress={() => handleTabPress(tab.route)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tabContent}>
                      <IconSymbol
                        ios_icon_name={tab.iosIcon}
                        android_material_icon_name={tab.androidIcon as any}
                        size={24}
                        color={iconColor}
                      />
                      <Text
                        style={[
                          styles.tabLabel,
                          { color: labelColor },
                          isActive && styles.tabLabelActive,
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
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
    paddingHorizontal: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
    fontFamily: 'Poppins_500Medium',
  },
  tabLabelActive: {
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
});
