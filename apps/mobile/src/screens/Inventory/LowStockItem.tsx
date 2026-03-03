import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { LowStockItem as LowStockItemType } from '../../api/inventory.api';
import Badge from '../../components/common/Badge';

interface LowStockItemProps {
  readonly item: LowStockItemType;
}

function LowStockItem({ item }: LowStockItemProps) {
  const isCritical = item.stock === 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={2}>
          {item.productName}
        </Text>
        <Badge
          label={isCritical ? 'TUGADI' : 'KAM'}
          variant={isCritical ? 'error' : 'warning'}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.warehouse}>{item.warehouseName}</Text>
        <Text style={styles.stock}>
          {item.stock} / min {item.minStockLevel}
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
    color: '#DC2626',
  },
});
