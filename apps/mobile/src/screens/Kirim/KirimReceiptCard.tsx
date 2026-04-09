// KirimReceiptCard.tsx — yagona kirim kartasi komponenti

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { Receipt } from '../../api/inventory.api';
import { formatUZS } from '../../utils/currency';
import { C } from './KirimColors';
import { STATUS_CFG } from './KirimTypes';

interface ReceiptCardProps {
  readonly receipt: Receipt;
  readonly onPress: () => void;
}

export function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  const cfg = STATUS_CFG[receipt.status];

  return (
    <TouchableOpacity style={styles.receiptCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.receiptHeader}>
        <View style={styles.receiptLeft}>
          <View style={styles.receiptIconWrap}>
            <MaterialCommunityIcons name="package-variant" size={20} color={C.primary} />
          </View>
          <View>
            <Text style={styles.receiptNumber}>{receipt.receiptNumber}</Text>
            <Text style={styles.receiptSupplier}>{receipt.supplierName}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={styles.receiptFooter}>
        <View style={styles.receiptMeta}>
          <Ionicons name="calendar-outline" size={13} color={C.muted} />
          <Text style={styles.receiptDate}>{receipt.date}</Text>
          <Text style={styles.receiptDot}>·</Text>
          <Text style={styles.receiptItems}>{receipt.itemsCount} ta mahsulot</Text>
        </View>
        <Text style={styles.receiptAmount}>{formatUZS(receipt.totalCost)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  receiptCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  receiptIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptNumber:   { fontSize: 15, fontWeight: '700', color: C.text },
  receiptSupplier: { fontSize: 12, color: C.secondary, marginTop: 2 },
  statusBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:      { fontSize: 11, fontWeight: '700' },
  receiptFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptMeta:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  receiptDate:     { fontSize: 12, color: C.muted },
  receiptDot:      { fontSize: 12, color: C.muted },
  receiptItems:    { fontSize: 12, color: C.secondary },
  receiptAmount:   { fontSize: 14, fontWeight: '700', color: C.text },
});
