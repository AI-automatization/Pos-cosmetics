// KirimReceiptCard.tsx — yagona kirim kartasi komponenti
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Receipt } from '../../api/inventory.api';
import { formatUZS } from '../../utils/currency';
import { C } from './KirimColors';
import { STATUS_CFG } from './KirimTypes';

const MONO = Platform.select({ ios: 'Courier New', android: 'monospace' });

interface ReceiptCardProps {
  readonly receipt: Receipt;
  readonly onPress: () => void;
}

export function ReceiptCard({ receipt, onPress }: ReceiptCardProps) {
  const cfg = STATUS_CFG[receipt.status];

  const dateStr = receipt.date
    ? new Date(receipt.date).toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Top row: receipt ID + status badge */}
      <View style={styles.topRow}>
        <Text style={styles.receiptNumber}>{receipt.receiptNumber}</Text>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Supplier row */}
      <View style={styles.supplierRow}>
        <Ionicons name="business-outline" size={13} color={C.muted} />
        <Text style={styles.supplierText} numberOfLines={1}>{receipt.supplierName}</Text>
      </View>

      {/* Bottom row: date + items + amount */}
      <View style={styles.bottomRow}>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={C.muted} />
          <Text style={styles.metaText}>{dateStr}</Text>
          <Text style={styles.dot}>·</Text>
          <Ionicons name="cube-outline" size={12} color={C.muted} />
          <Text style={styles.metaText}>{receipt.itemsCount} ta mahsulot</Text>
        </View>
        <Text style={styles.amount}>{formatUZS(receipt.totalCost)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: MONO,
    letterSpacing: 0.3,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  supplierText: {
    fontSize: 13,
    color: C.secondary,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: C.muted,
  },
  dot: {
    fontSize: 12,
    color: C.muted,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
  },
});
