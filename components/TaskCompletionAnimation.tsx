
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface TaskCompletionAnimationProps {
  visible: boolean;
  coins: number;
  onComplete: () => void;
  showCoins?: boolean;
}

function CoinAnimation({ delay, index }: { delay: number; index: number }) {
  const translateX = useSharedValue(width / 2);
  const translateY = useSharedValue(height / 2);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    const randomX = Math.random() * width - width / 2;
    const randomY = Math.random() * height - height / 2;
    
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    
    translateX.value = withDelay(
      delay,
      withSpring(randomX, {
        damping: 10,
        stiffness: 50,
      })
    );
    
    translateY.value = withDelay(
      delay,
      withSpring(randomY, {
        damping: 10,
        stiffness: 50,
      })
    );
    
    rotate.value = withDelay(
      delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1), {
        duration: 1000,
        easing: Easing.linear,
      })
    );

    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 });
    }, delay + 1500);
  }, [delay, opacity, rotate, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.coin, animatedStyle]}>
      <Text style={styles.coinEmoji}>🪙</Text>
    </Animated.View>
  );
}

export default function TaskCompletionAnimation({
  visible,
  coins,
  onComplete,
  showCoins = true,
}: TaskCompletionAnimationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const smileyScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate smiley
      smileyScale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );

      // Animate container
      scale.value = withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
      opacity.value = withTiming(1, { duration: 300 });

      // Hide after animation completes
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(onComplete)();
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible, onComplete, opacity, scale, smileyScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const smileyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: smileyScale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* Flying coins - only show if showCoins is true */}
      {showCoins && Array.from({ length: 8 }).map((_, index) => (
        <CoinAnimation key={index} delay={index * 100} index={index} />
      ))}

      {/* Center content */}
      <Animated.View style={[styles.container, animatedStyle]}>
        <Animated.View style={smileyAnimatedStyle}>
          <Text style={styles.bigSmiley}>😊</Text>
        </Animated.View>
        <Text style={styles.text}>Goed gedaan!</Text>
        {showCoins && (
          <View style={styles.coinsContainer}>
            <Text style={styles.coinsText}>+{coins}</Text>
            <Text style={styles.coinEmojiLarge}>🪙</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    boxShadow: `0px 8px 24px ${colors.shadow}`,
    elevation: 8,
  },
  bigSmiley: {
    fontSize: 100,
    marginBottom: 10,
  },
  text: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 10,
    fontFamily: 'Poppins_700Bold',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: colors.highlight,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  coinsText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.card,
    marginRight: 10,
    fontFamily: 'Poppins_700Bold',
  },
  coinEmojiLarge: {
    fontSize: 32,
  },
  coin: {
    position: 'absolute',
    top: height / 2,
    left: width / 2,
  },
  coinEmoji: {
    fontSize: 40,
  },
});
