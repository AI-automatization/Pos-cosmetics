import React from 'react';
import { View, Text } from 'react-native';
import { fmt, type SaleProduct } from './SalesTypes';
import styles from './SaleDetailModal.styles';

interface SaleDetailItemsProps {
  readonly products: readonly SaleProduct[];
  readonly totalItems: number;
}

export default function SaleDetailItems({ products, totalItems }: SaleDetailItemsProps) {
  const subtotal = products.reduce((s, p) => s + p.price * p.qty, 0);

  return (
    <>
      {/* Items */}
      <Text style={styles.sectionTitle}>MAHSULOTLAR</Text>
      <View style={styles.itemsList}>
        {products.map((p, i) => (
          <View key={i} style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemName} numberOfLines={1}>{p.name}</Text>
              <Text style={styles.itemMeta}>
                {p.qty} x {fmt(p.price)} UZS
              </Text>
            </View>
            <Text style={styles.itemTotal}>
              {fmt(p.qty * p.price)} UZS
            </Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Jami mahsulot</Text>
          <Text style={styles.summaryValue}>{totalItems} ta</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotalLabel}>Umumiy summa</Text>
          <Text style={styles.summaryTotalValue}>{fmt(subtotal)} UZS</Text>
        </View>
      </View>
    </>
  );
}
