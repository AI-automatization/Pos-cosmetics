// KirimStatsChips.tsx — statistika chip'lari komponenti

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { Receipt } from '../../api/inventory.api';
import { formatCompact } from '../../utils/currency';
import { C } from './KirimColors';

interface StatsChipsProps {
  readonly receipts: Receipt[];
}

export const StatsChips = React.memo(function StatsChips({ receipts }: StatsChipsProps) {
  const total    = receipts.length;
  const pending  = receipts.filter((r) => r.status === 'PENDING').length;
  const received = receipts.filter((r) => r.status === 'RECEIVED').length;
  const totalAmt = receipts.reduce((s, r) => s + r.totalCost, 0);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
    >
      <View style={[styles.chip, styles.chipPrimary]}>
        <Text style={[styles.chipValue, styles.chipValuePrimary]}>{total}</Text>
        <Text style={[styles.chipLabel, styles.chipLabelPrimary]}>Jami</Text>
      </View>
      <View style={[styles.chip, styles.chipOrange]}>
        <Text style={[styles.chipValue, styles.chipValueOrange]}>{pending}</Text>
        <Text style={[styles.chipLabel, styles.chipLabelOrange]}>Kutilmoqda</Text>
      </View>
      <View style={[styles.chip, styles.chipGreen]}>
        <Text style={[styles.chipValue, styles.chipValueGreen]}>{received}</Text>
        <Text style={[styles.chipLabel, styles.chipLabelGreen]}>Qabul qilingan</Text>
      </View>
      <View style={[styles.chip, styles.chipBlue]}>
        <Text style={[styles.chipValue, styles.chipValueBlue]}>{formatCompact(totalAmt)}</Text>
        <Text style={[styles.chipLabel, styles.chipLabelBlue]}>Jami summa</Text>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  chipsRow: {
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  chipPrimary:  { backgroundColor: C.primary + '15' },
  chipOrange:   { backgroundColor: '#FEF3C7' },
  chipGreen:    { backgroundColor: '#D1FAE5' },
  chipBlue:     { backgroundColor: '#EFF6FF' },
  chipValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  chipValuePrimary: { color: C.primary },
  chipValueOrange:  { color: C.orange },
  chipValueGreen:   { color: C.green },
  chipValueBlue:    { color: C.blue },
  chipLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  chipLabelPrimary: { color: C.primary },
  chipLabelOrange:  { color: C.orange },
  chipLabelGreen:   { color: C.green },
  chipLabelBlue:    { color: C.blue },
});
