import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type CartItem, type PaymentMethod, fmt, METHODS } from './PaymentSheetTypes';

// ─── Props ─────────────────────────────────────────────────────────────────

interface OrderSummarySectionProps {
  readonly items: CartItem[];
  readonly paymentMethod: PaymentMethod;
  readonly taxRate?: number;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function OrderSummarySection({
  items,
  paymentMethod,
  taxRate = 0.12,
}: OrderSummarySectionProps) {
  const subtotal = items.reduce(
    (sum, ci) => sum + ci.product.sellPrice * ci.qty,
    0,
  );
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const FALLBACK_METHOD = { key: paymentMethod, label: paymentMethod, icon: 'cash', color: '#6B7280' } as const;
  const method = METHODS.find((m) => m.key === paymentMethod) ?? FALLBACK_METHOD;

  return (
    <View>
      {/* ── Item rows ── */}
      {items.map((ci, index) => (
        <View key={ci.product.id}>
          <View style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {ci.product.name}
            </Text>
            <Text style={styles.itemAmount}>
              {ci.qty} × {fmt(ci.product.sellPrice)}
            </Text>
          </View>
          {index < items.length - 1 && <View style={styles.rowSeparator} />}
        </View>
      ))}

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Totals ── */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Jami</Text>
        <Text style={styles.totalValue}>{fmt(subtotal)}</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>QQS (12%)</Text>
        <Text style={styles.totalValue}>{fmt(tax)}</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.finalLabel}>To'lov summasi</Text>
        <Text style={styles.finalValue}>{fmt(total)}</Text>
      </View>

      {/* ── Payment method badge ── */}
      <View style={styles.badgeWrapper}>
        <View style={[styles.badge, { backgroundColor: method.color }]}>
          <MaterialCommunityIcons
            name={method.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
            size={14}
            color="#FFFFFF"
          />
          <Text style={styles.badgeLabel}>{method.label}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  itemAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  rowSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  finalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  finalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  badgeWrapper: {
    alignItems: 'center',
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
