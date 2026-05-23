// Ombor screen — StatsRow component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { LowStockItem } from '../../api/inventory.api';
import { C } from './OmborColors';
import { getStatus } from './OmborTypes';

interface StatsRowProps {
  readonly items: LowStockItem[];
}

export default function OmborStatsRow({ items }: StatsRowProps) {
  const total  = items.length;
  const kam    = items.filter((i) => getStatus(i) === 'KAM').length;
  const tugadi = items.filter((i) => getStatus(i) === 'TUGADI').length;
  const normal = total - kam - tugadi;

  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>JAMI</Text>
        <Text style={[styles.statValue, { color: C.primary }]}>{total}</Text>
      </View>
      <View style={[styles.statCard, styles.statBorderGreen]}>
        <Text style={styles.statLabel}>NORMAL</Text>
        <Text style={[styles.statValue, { color: C.green }]}>{normal}</Text>
      </View>
      <View style={[styles.statCard, styles.statBorderOrange]}>
        <Text style={styles.statLabel}>KAM</Text>
        <Text style={[styles.statValue, { color: C.orange }]}>{kam}</Text>
      </View>
      <View style={[styles.statCard, styles.statBorderRed]}>
        <Text style={styles.statLabel}>TUGADI</Text>
        <Text style={[styles.statValue, { color: C.red }]}>{tugadi}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statBorderGreen:  { borderLeftWidth: 3, borderLeftColor: '#16A34A' },
  statBorderOrange: { borderLeftWidth: 3, borderLeftColor: '#D97706' },
  statBorderRed:    { borderLeftWidth: 3, borderLeftColor: '#DC2626' },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.muted,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
});
