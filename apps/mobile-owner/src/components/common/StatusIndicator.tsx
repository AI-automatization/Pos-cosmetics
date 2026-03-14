import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StatusType = 'healthy' | 'degraded' | 'error' | 'offline';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
}

const STATUS_COLORS: Record<StatusType, string> = {
  healthy: '#16A34A',
  degraded: '#CA8A04',
  error: '#DC2626',
  offline: '#9CA3AF',
};

export default function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const color = STATUS_COLORS[status];
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      {label && <Text style={[styles.label, { color }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
