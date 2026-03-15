import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatPercent } from '@/utils/format';

interface TrendIndicatorProps {
  value: number;
}

export default function TrendIndicator({ value }: TrendIndicatorProps): React.JSX.Element {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <View style={styles.container}>
      <Text style={[
        styles.text,
        isNeutral ? styles.neutral : isPositive ? styles.positive : styles.negative,
      ]}>
        {isNeutral ? '—' : (isPositive ? '↑' : '↓')} {formatPercent(Math.abs(value))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  positive: {
    color: '#16a34a',
  },
  negative: {
    color: '#dc2626',
  },
  neutral: {
    color: '#6b7280',
  },
});
