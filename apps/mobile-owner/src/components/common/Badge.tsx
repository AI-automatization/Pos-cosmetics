import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  style?: ViewStyle;
}

const COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#DCFCE7', text: '#16A34A' },
  warning: { bg: '#FEF9C3', text: '#CA8A04' },
  error: { bg: '#FEE2E2', text: '#DC2626' },
  info: { bg: '#DBEAFE', text: '#2563EB' },
  neutral: { bg: '#F3F4F6', text: '#6B7280' },
};

export default function Badge({ label, variant, style }: BadgeProps) {
  const { bg, text } = COLORS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
