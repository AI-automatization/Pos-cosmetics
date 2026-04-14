import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { C } from './SalesColors';
import { fmt, type OrderStatus } from './SalesTypes';
import type { Sale } from './SalesTypes';

// ─── Status badge config ───────────────────────────────────────
const STATUS_STYLE: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  COMPLETED: { bg: '#D1FAE5', text: '#16A34A', label: 'Bajarildi' },
  RETURNED:  { bg: '#FEE2E2', text: '#DC2626', label: 'Qaytarildi' },
  VOIDED:    { bg: '#F3F4F6', text: '#6B7280', label: 'Bekor qilindi' },
};

// ─── SaleRow ──────────────────────────────────────────────────
interface SaleRowProps {
  readonly sale: Sale;
  readonly onPress: (sale: Sale) => void;
}

export default function SaleRow({ sale, onPress }: SaleRowProps) {
  const status = STATUS_STYLE[sale.status] ?? STATUS_STYLE.COMPLETED;

  return (
    <TouchableOpacity
      style={styles.saleRow}
      activeOpacity={0.75}
      onPress={() => onPress(sale)}
    >
      <View style={styles.saleLeft}>
        <Text style={styles.saleId}>#{String(sale.num).padStart(4, '0')}</Text>
        <Text style={styles.saleMeta}>{sale.time}  ·  {sale.items} ta mahsulot</Text>
      </View>
      <View style={styles.saleRight}>
        <Text style={styles.saleAmount}>{fmt(sale.amount)} UZS</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  saleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: C.white,
  },
  saleLeft: {
    gap: 4,
  },
  saleId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
    letterSpacing: 0.5,
  },
  saleMeta: {
    fontSize: 12,
    color: C.secondary,
  },
  saleRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  saleAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
