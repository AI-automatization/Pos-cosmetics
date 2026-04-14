import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

type CardVariant = 'default' | 'elevated' | 'flat';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
  padding?: number;
}

export default function Card({
  children,
  style,
  variant = 'default',
  padding = 16,
}: CardProps) {
  return (
    <View style={[styles.base, styles[variant], { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  flat: {
    // Shadow yo'q — background rang farqi orqali ajratiladi
  },
});
