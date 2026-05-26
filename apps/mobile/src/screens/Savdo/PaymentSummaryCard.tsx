import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fmt, type CartItem } from './PaymentSheetTypes';

// ─── Props ─────────────────────────────────────────────
interface Props {
  readonly cart: CartItem[];
  readonly total: number;
  readonly onRemoveItem?: (productId: string) => void;
}

// ─── Component ─────────────────────────────────────────
export default function PaymentSummaryCard({ cart, total, onRemoveItem }: Props) {
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.summaryLabel}>Buyurtma xulosasi</Text>
          <Text style={styles.summaryItems}>{itemCount} ta mahsulot</Text>
        </View>
        <View style={styles.summaryRight}>
          <Text style={styles.summaryLabel}>Umumiy summa</Text>
          <Text style={styles.summaryTotal}>{fmt(total)}</Text>
        </View>
      </View>

      {cart.length > 0 && (
        <ScrollView
          style={styles.itemList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {cart.map((item) => (
            <View key={item.product.id} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={styles.itemQty}>x{item.qty}</Text>
              <Text style={styles.itemPrice}>
                {fmt(item.product.sellPrice * item.qty)}
              </Text>
              {onRemoveItem != null && (
                <TouchableOpacity
                  style={styles.itemRemoveBtn}
                  onPress={() => onRemoveItem(item.product.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={14} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryItems: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5B5BD6',
  },
  itemList: {
    marginTop: 12,
    maxHeight: 140,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  itemQty: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
    minWidth: 24,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    minWidth: 80,
    textAlign: 'right',
  },
  itemRemoveBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
