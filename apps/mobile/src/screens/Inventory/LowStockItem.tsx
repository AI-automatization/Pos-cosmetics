import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { InventoryItem, InventoryItemStatus } from '../../api/inventory.api';
import Badge from '../../components/common/Badge';

interface LowStockItemProps {
  readonly item: InventoryItem;
}

const STATUS_BADGE: Record<InventoryItemStatus, { label: string; variant: 'danger' | 'warning' | 'info' | 'success' }> = {
  out_of_stock: { label: 'TUGADI',   variant: 'danger' },
  low:          { label: 'KAM',      variant: 'warning' },
  expiring:     { label: 'MUDDATI',  variant: 'warning' },
  expired:      { label: 'MUDDATI O\'TDI', variant: 'danger' },
  normal:       { label: 'NORMAL',   variant: 'success' },
};

function LowStockItem({ item }: LowStockItemProps) {
  const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.normal;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={2}>
          {item.productName}
        </Text>
        <Badge label={badge.label} variant={badge.variant} />
      </View>
      <View style={styles.row}>
        <Text style={styles.warehouse}>{item.branchName ?? '—'}</Text>
        <Text style={[styles.stock, item.quantity === 0 && styles.stockCritical]}>
          {item.quantity} {item.unit}
        </Text>
      </View>
    </View>
  );
}

export default memo(LowStockItem);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  warehouse: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  stock: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  stockCritical: {
    color: '#DC2626',
  },
});
