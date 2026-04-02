import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TrendBadgeProps {
  value: number;
}

export default function TrendBadge({ value }: TrendBadgeProps) {
  if (value === 0) {
    return (
      <View style={[styles.badge, styles.neutral]}>
        <Text style={[styles.text, styles.neutralText]}>0%</Text>
      </View>
    );
  }

  const isPositive = value > 0;
  return (
    <View style={[styles.badge, isPositive ? styles.positive : styles.negative]}>
      <Ionicons
        name={isPositive ? 'trending-up' : 'trending-down'}
        size={12}
        color={isPositive ? '#16A34A' : '#DC2626'}
      />
      <Text style={[styles.text, isPositive ? styles.positiveText : styles.negativeText]}>
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
    gap: 2,
  },
  positive: { backgroundColor: '#DCFCE7' },
  negative: { backgroundColor: '#FEE2E2' },
  neutral: { backgroundColor: '#F3F4F6' },
  text: { fontSize: 12, fontWeight: '600' },
  positiveText: { color: '#16A34A' },
  negativeText: { color: '#DC2626' },
  neutralText: { color: '#6B7280' },
});
