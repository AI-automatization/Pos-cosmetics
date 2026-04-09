import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from './SalesColors';
import { fmtStat } from './SalesTypes';

interface SalesStatsGridProps {
  readonly total: number;
  readonly count: number;
  readonly avg: number;
}

export default function SalesStatsGrid({ total, count, avg }: SalesStatsGridProps) {
  const stats = [
    { label: 'TUSHUM',    value: fmtStat(total) },
    { label: 'SONI',      value: `${count} ta` },
    { label: "O'RTACHA",  value: fmtStat(avg) },
  ];

  return (
    <View style={styles.statsGrid}>
      {stats.map((s, i) => (
        <React.Fragment key={s.label}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
          {i < stats.length - 1 && <View style={styles.statDivider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    backgroundColor: C.white,
    borderRadius: 14,
    flexDirection: 'row',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: C.border,
    marginVertical: 4,
  },
});
