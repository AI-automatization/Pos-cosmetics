import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonBoxProps): React.JSX.Element {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as number, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonCard(): React.JSX.Element {
  return (
    <View style={styles.card}>
      <SkeletonBox height={14} width="40%" style={styles.mb8} />
      <SkeletonBox height={28} width="70%" style={styles.mb8} />
      <SkeletonBox height={12} width="30%" />
    </View>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }): React.JSX.Element {
  return (
    <View style={styles.card}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={i < count - 1 ? styles.mb12 : undefined}>
          <SkeletonBox height={14} width="60%" style={styles.mb6} />
          <SkeletonBox height={12} width="40%" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e7eb',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  mb6: { marginBottom: 6 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
});
