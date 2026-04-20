import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ─── Constants ──────────────────────────────────────────
const GREEN = '#16A34A';
const DEFAULT_SIZE = 120;

// ─── Props ───────────────────────────────────────────────
interface SuccessAnimationProps {
  readonly size?: number;
}

// ─── Component ───────────────────────────────────────────
export default function SuccessAnimation({ size = DEFAULT_SIZE }: SuccessAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const circleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    transform: [{ scale: scaleAnim }],
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.circle, circleStyle]}>
        <Animated.View style={{ opacity: opacityAnim }}>
          <Ionicons name="checkmark" size={size * 0.5} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
