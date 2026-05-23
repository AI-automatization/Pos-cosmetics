import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { TopProduct } from '@raos/types';
import Card from '../../components/common/Card';
import { formatUZS } from '../../utils/currency';

interface TopProductsCardProps {
  readonly products: TopProduct[];
  readonly onSeeAll?: () => void;
}

export default function TopProductsCard({ products, onSeeAll }: TopProductsCardProps) {
  return (
    <Card>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Top mahsulotlar bugun</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAll}>Hammasi</Text>
          </TouchableOpacity>
        )}
      </View>

      {products.map((item, index) => (
        <React.Fragment key={item.productId}>
          {index > 0 && <View style={styles.separator} />}
          <View style={styles.row}>
            <View style={styles.rankCircle}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {item.productName}
            </Text>
            <View style={styles.right}>
              <Text style={styles.qty}>{item.totalQty} ta</Text>
              <Text style={styles.revenue}>{formatUZS(item.totalRevenue)}</Text>
            </View>
          </View>
        </React.Fragment>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  seeAll: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  qty: {
    fontSize: 12,
    color: '#6B7280',
  },
  revenue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
});
