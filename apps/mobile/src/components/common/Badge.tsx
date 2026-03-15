import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#dcfce7', text: '#16a34a' },
  error:   { bg: '#fee2e2', text: '#dc2626' },
  warning: { bg: '#fef9c3', text: '#ca8a04' },
  info:    { bg: '#dbeafe', text: '#1d4ed8' },
  default: { bg: '#f3f4f6', text: '#6b7280' },
};

export default function Badge({ label, variant = 'default' }: BadgeProps): React.JSX.Element {
  const color = COLORS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
