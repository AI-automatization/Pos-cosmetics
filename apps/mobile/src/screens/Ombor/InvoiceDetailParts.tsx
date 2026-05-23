import React from 'react';
import { View, Text } from 'react-native';
import type { InvoiceDetailItem } from '../../api/inventory.api';
import { styles } from './InvoiceDetailSheet.styles';

// ─── Constants ───────────────────────────────────────────
type InvoiceStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

const STATUS_CFG: Record<InvoiceStatus, { bg: string; color: string; label: string }> = {
  PENDING:   { bg: '#FEF3C7', color: '#D97706', label: 'Kutilmoqda' },
  RECEIVED:  { bg: '#DCFCE7', color: '#16A34A', label: 'Qabul qilindi' },
  CANCELLED: { bg: '#F3F4F6', color: '#6B7280', label: 'Bekor' },
};

// ─── Helpers ─────────────────────────────────────────────
export function fmt(n: number): string {
  return n.toLocaleString('uz-UZ') + " so'm";
}

export function formatDateTime(d: string): string {
  const date = new Date(d);
  return (
    date.toLocaleDateString('uz-UZ', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
    }) +
    ' \u00B7 ' +
    date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  );
}

// ─── StatusBadge ─────────────────────────────────────────
interface StatusBadgeProps {
  readonly status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CFG[status as InvoiceStatus] ?? STATUS_CFG.CANCELLED;
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ─── InfoRow ─────────────────────────────────────────────
interface InfoRowProps {
  readonly label: string;
  readonly value: string;
}

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

// ─── ItemRow ─────────────────────────────────────────────
interface ItemRowProps {
  readonly item: InvoiceDetailItem;
}

export function ItemRow({ item }: ItemRowProps) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.productName}
        </Text>
        <Text style={styles.itemMeta}>
          {item.quantity} dona x {fmt(item.purchasePrice)}
        </Text>
        {item.batchNumber !== null && item.batchNumber !== undefined && (
          <Text style={styles.itemBatch}>Batch: {item.batchNumber}</Text>
        )}
      </View>
      <Text style={styles.itemTotal}>{fmt(item.totalCost)}</Text>
    </View>
  );
}
