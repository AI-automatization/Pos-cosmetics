import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { type DeadStockItem } from '../../api/analytics.api';
import { Colors, Radii } from '../../config/theme';
import { fmt, idleColor, formatDate } from './dead-stock.utils';

interface DeadStockCardProps {
  readonly item: DeadStockItem;
  readonly rank: number;
}

export default function DeadStockCard({ item, rank }: DeadStockCardProps) {
  const ic = idleColor(item.daysIdle);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardRank}>{rank}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.productName}
          </Text>
          {item.sku && <Text style={styles.cardSku}>{item.sku}</Text>}
        </View>
        <View style={[styles.idleBadge, { backgroundColor: ic.bg }]}>
          <Text style={[styles.idleText, { color: ic.text }]}>{item.daysIdle} kun</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Zaxira</Text>
          <Text style={styles.detailValue}>{item.totalStock.toFixed(0)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Oxirgi sotuv</Text>
          <Text style={styles.detailValue}>{formatDate(item.lastSoldAt)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Zarar</Text>
          <Text style={[styles.detailValue, { color: Colors.danger }]}>
            {fmt(item.carryingCost)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardRank: {
    width: 22,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  cardSku: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
    fontFamily: 'monospace',
  },
  idleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  idleText: { fontSize: 12, fontWeight: '800' },
  detailRow: { flexDirection: 'row', gap: 4 },
  detailItem: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
});
