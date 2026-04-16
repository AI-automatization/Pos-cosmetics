import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from './SalesColors';
import { fmt, METHOD_STYLE } from './SalesTypes';
import type { Payment, Sale } from './SalesTypes';

// ─── PayBadge ─────────────────────────────────────────────────
interface PayBadgeProps {
  readonly payment: Payment;
}

export function PayBadge({ payment }: PayBadgeProps) {
  const m = METHOD_STYLE[payment.method];
  return (
    <View style={[styles.methodBadge, { backgroundColor: m.bg }]}>
      <Text style={[styles.methodText, { color: m.text }]}>
        {m.icon} {m.label}
      </Text>
    </View>
  );
}

// ─── SaleRow ──────────────────────────────────────────────────
interface SaleRowProps {
  readonly sale: Sale;
  readonly onPress: (sale: Sale) => void;
}

export default function SaleRow({ sale, onPress }: SaleRowProps) {
  return (
    <TouchableOpacity
      style={styles.saleRow}
      activeOpacity={0.75}
      onPress={() => onPress(sale)}
    >
      <View style={styles.saleLeft}>
        <Text style={styles.saleNum}>#{sale.num}</Text>
        <Text style={styles.saleMeta}>{sale.time}  ·  {sale.items} ta mahsulot</Text>
      </View>
      <View style={styles.saleRight}>
        <Text style={styles.saleAmount}>{fmt(sale.amount)}</Text>
        <PayBadge payment={sale.payments[0]!} />
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
  saleNum: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
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
  methodBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
