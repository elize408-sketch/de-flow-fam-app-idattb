
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import * as Haptics from 'expo-haptics';

interface TaskCompletionAnimationProps {
  visible: boolean;
  coins: number;
  onComplete: () => void;
}

export default function TaskCompletionAnimation({
  visible,
  coins,
  onComplete,
}: TaskCompletionAnimationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      scale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
      opacity.value = withTiming(1, { duration: 300 });

      // Hide after 2 seconds
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(onComplete)();
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Text style={styles.emoji}>👍</Text>
        <Text style={styles.emoji}>😊</Text>
        <Text style={styles.text}>Goed gedaan!</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>+{coins}</Text>
          <Text style={styles.coinEmoji}>🪙</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  emoji: {
    fontSize: 60,
    marginVertical: 5,
  },
  text: {
    fontSize: 24,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  coinsText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.card,
    marginRight: 8,
    fontFamily: 'Poppins_700Bold',
  },
  coinEmoji: {
    fontSize: 28,
  },
});
