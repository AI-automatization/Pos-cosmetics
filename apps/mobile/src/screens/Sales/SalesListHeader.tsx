import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from './SalesColors';
import SalesShiftCard from './SalesShiftCard';
import SalesStatsGrid from './SalesStatsGrid';

export interface SalesListHeaderProps {
  readonly cashierName: string;
  readonly startTime: string;
  readonly isShiftOpen: boolean;
  readonly total: number;
  readonly count: number;
  readonly avg: number;
}

export default function SalesListHeader({
  cashierName,
  startTime,
  isShiftOpen,
  total,
  count,
  avg,
}: SalesListHeaderProps) {
  return (
    <View style={styles.listHeader}>
      {isShiftOpen && (
        <SalesShiftCard cashierName={cashierName} startTime={startTime} />
      )}
      <SalesStatsGrid total={total} count={count} avg={avg} />
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Sotuvlar tarixi</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listHeader: {
    padding: 16,
    gap: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
});
