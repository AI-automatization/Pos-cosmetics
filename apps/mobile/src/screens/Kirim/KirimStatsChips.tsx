// KirimStatsChips.tsx — statistika row komponenti
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Receipt } from '../../api/inventory.api';
import { C } from './KirimColors';

interface StatsChipsProps {
  readonly receipts: Receipt[];
}

export const StatsChips = React.memo(function StatsChips({ receipts }: StatsChipsProps) {
  const total    = receipts.length;
  const pending  = receipts.filter((r) => r.status === 'PENDING').length;
  const received = receipts.filter((r) => r.status === 'RECEIVED').length;

  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Text style={styles.statLabel}>JAMI</Text>
        <Text style={[styles.statValue, { color: C.primary }]}>{total}</Text>
      </View>
      <View style={[styles.statCard, styles.statBorderOrange]}>
        <Text style={styles.statLabel}>KUTILMOQDA</Text>
        <Text style={[styles.statValue, { color: C.orange }]}>{pending}</Text>
      </View>
      <View style={[styles.statCard, styles.statBorderGreen]}>
        <Text style={styles.statLabel}>QABUL QILINDI</Text>
        <Text style={[styles.statValue, { color: C.green }]}>{received}</Text>
      </View>
    </View>
  );
});

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
  statBorderOrange: { borderLeftWidth: 3, borderLeftColor: C.orange },
  statBorderGreen:  { borderLeftWidth: 3, borderLeftColor: C.green },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
});
