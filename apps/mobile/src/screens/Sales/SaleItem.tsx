import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Order } from '@raos/types';
import Badge from '../../components/common/Badge';
import { formatUZS } from '../../utils/currency';
import { formatTime } from '../../utils/date';

interface SaleItemProps {
  readonly order: Order;
}

function SaleItem({ order }: SaleItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.orderNum}>#{order.orderNumber}</Text>
        <Badge
          label={order.status}
          variant={order.status === 'COMPLETED' ? 'success' : 'warning'}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.items}>{order.items.length} mahsulot</Text>
        <Text style={styles.time}>{formatTime(order.createdAt)}</Text>
      </View>
      <Text style={styles.total}>{formatUZS(order.total)}</Text>
    </View>
  );
}

export default memo(SaleItem);

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
    marginBottom: 4,
  },
  orderNum: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  items: {
    fontSize: 13,
    color: '#6B7280',
  },
  time: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
    marginTop: 4,
  },
});
