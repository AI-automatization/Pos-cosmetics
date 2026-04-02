import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TopProduct } from '@raos/types';
import Card from '../../components/common/Card';
import { formatUZS } from '../../utils/currency';

interface TopProductsCardProps {
  readonly products: TopProduct[];
}

export default function TopProductsCard({ products }: TopProductsCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <Text style={styles.sectionLabel}>{t('dashboard.topProducts')}</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.productId}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {item.productName}
            </Text>
            <View style={styles.right}>
              <Text style={styles.qty}>{item.totalQty} ta</Text>
              <Text style={styles.revenue}>{formatUZS(item.totalRevenue)}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rank: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
    width: 20,
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  right: {
    alignItems: 'flex-end',
  },
  qty: {
    fontSize: 13,
    color: '#6B7280',
  },
  revenue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  separator: {
    height: 10,
  },
});
