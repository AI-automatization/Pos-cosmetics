// Ombor — TesterCard: single tester/sample history item
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { TesterMovement } from '../../api/inventory.api';
import { C } from './OmborColors';

// ─── Helpers ──────────────────────────────────────────────

function fmtPrice(n: number): string {
  return n.toLocaleString('uz-UZ').replace(/,/g, ' ');
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Props ────────────────────────────────────────────────

interface TesterCardProps {
  readonly item: TesterMovement;
}

// ─── Component ────────────────────────────────────────────

function TesterCard({ item }: TesterCardProps) {
  const cost = item.costPrice ?? 0;
  const total = item.quantity * cost;

  return (
    <View style={styles.card}>
      <Text style={styles.productName} numberOfLines={1}>
        {item.product.name}
      </Text>

      {item.product.sku ? (
        <Text style={styles.sku} numberOfLines={1}>
          {item.product.sku}
        </Text>
      ) : null}

      <View style={styles.warehouseRow}>
        <Ionicons name="location-outline" size={12} color={C.muted} />
        <Text style={styles.warehouseText} numberOfLines={1}>
          {item.warehouse.name}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{item.quantity} dona</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{fmtPrice(cost)} UZS/dona</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statTotal}>{fmtPrice(total)} UZS</Text>
        </View>
      </View>

      {item.note ? (
        <Text style={styles.note} numberOfLines={2}>
          {item.note}
        </Text>
      ) : null}

      <Text style={styles.date}>{fmtDate(item.createdAt)}</Text>
    </View>
  );
}

export default React.memo(TesterCard);

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 3,
    borderLeftColor: C.orange,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  productName: { fontSize: 15, fontWeight: '700', color: C.text },
  sku: { fontSize: 12, color: C.muted, marginTop: 2 },
  warehouseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  warehouseText: { fontSize: 12, color: C.muted },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  stat: { flex: 1 },
  divider: { width: 1, height: 16, backgroundColor: C.border },
  statLabel: { fontSize: 12, color: C.secondary, textAlign: 'center' },
  statTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    color: C.muted,
    fontStyle: 'italic',
    marginTop: 6,
  },
  date: { fontSize: 11, color: C.muted, marginTop: 6, textAlign: 'right' },
});
