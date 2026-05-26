import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './OrderDetailSheet.styles';

// ─── Types ───────────────────────────────────────────
export interface OrderLineItem {
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
  total: number;
}

// ─── Helpers ─────────────────────────────────────────
export function fmt(n: number): string {
  const abs = Math.abs(Number(n));
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (Number(n) < 0 ? '-' : '') + formatted + " so'm";
}

export function formatDateTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return (
    date.toLocaleDateString('uz-UZ', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
    }) +
    ' · ' +
    date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  );
}

// ─── SummaryRow ──────────────────────────────────────
interface SummaryRowProps {
  readonly label: string;
  readonly value: string;
  readonly bold?: boolean;
  readonly color?: string;
}

export function SummaryRow({ label, value, bold, color }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold ? styles.summaryLabelBold : null]}>
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          bold ? styles.summaryValueBold : null,
          color ? { color } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── LineItem ────────────────────────────────────────
export function LineItem({ item }: { readonly item: OrderLineItem }) {
  return (
    <View style={styles.lineItem}>
      <View style={styles.lineItemLeft}>
        <Text style={styles.lineItemName} numberOfLines={2}>
          {item.productName ?? item.productId}
        </Text>
        <Text style={styles.lineItemMeta}>
          {item.quantity} x {fmt(item.price)}
        </Text>
      </View>
      <Text style={styles.lineItemTotal}>{fmt(item.total)}</Text>
    </View>
  );
}
