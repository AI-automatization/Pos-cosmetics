import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'orange'
  | 'purple';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  /** Optional icon rendered to the left of text (e.g. from lucide-react-native) */
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const PALETTE: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#F0FDF4', text: '#16A34A' },
  warning: { bg: '#FFFBEB', text: '#D97706' },
  danger:  { bg: '#FEF2F2', text: '#DC2626' },
  info:    { bg: '#EFF6FF', text: '#2563EB' },
  neutral: { bg: '#F3F4F6', text: '#6B7280' },
  orange:  { bg: '#FFF7ED', text: '#EA580C' },
  purple:  { bg: '#F5F3FF', text: '#7C3AED' },
};

export default function Badge({
  label,
  variant = 'neutral',
  icon,
  style,
}: BadgeProps) {
  const { bg, text } = PALETTE[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.text, { color: text }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  iconWrap: {
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
