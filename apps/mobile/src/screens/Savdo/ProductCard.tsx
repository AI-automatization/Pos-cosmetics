import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface Product {
  id: string;
  name: string;
  sellPrice: number;
  categoryId: string;
  stockQty: number;
  minStockLevel: number;
  placeholderColor: string;
}

interface Props {
  product: Product;
  cartQty: number;
  onPress: (product: Product) => void;
  onDecrement?: (product: Product) => void;
}

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

function stockStatus(qty: number, min: number): StockStatus {
  if (qty === 0) return 'out_of_stock';
  if (qty <= min) return 'low_stock';
  return 'in_stock';
}

export default function ProductCard({ product, cartQty, onPress, onDecrement }: Props) {
  const status = stockStatus(product.stockQty, product.minStockLevel);
  const isOut = status === 'out_of_stock';

  return (
    <TouchableOpacity
      style={[styles.card, isOut && styles.cardDisabled]}
      onPress={() => !isOut && onPress(product)}
      activeOpacity={isOut ? 1 : 0.78}
    >
      {/* Image area */}
      <View style={[styles.imageArea, { backgroundColor: product.placeholderColor }]}>
        <Text style={styles.imageInitial}>{product.name[0]}</Text>

        {/* Stock badge */}
        {!isOut && (
          <View style={[styles.badge, status === 'low_stock' ? styles.badgeLow : styles.badgeIn]}>
            <Text style={styles.badgeText}>{product.stockQty} ta</Text>
          </View>
        )}

        {/* Out of stock overlay */}
        {isOut && (
          <View style={styles.outOverlay}>
            <Text style={styles.outText}>TUGAGAN</Text>
          </View>
        )}

        {/* Cart controls */}
        {cartQty > 0 && (
          <View style={styles.cartControls}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => onDecrement?.(product)}
              activeOpacity={0.7}
            >
              <Text style={styles.controlBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.controlQty}>{cartQty}</Text>
            <TouchableOpacity
              style={[styles.controlBtn, styles.controlBtnAdd, isOut && styles.controlBtnAddDisabled]}
              onPress={() => !isOut && onPress(product)}
              disabled={isOut}
              activeOpacity={isOut ? 1 : 0.7}
            >
              <Text style={[styles.controlBtnText, styles.controlBtnTextLight]}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={[styles.price, isOut && styles.priceOut]}>
          {formatPrice(product.sellPrice)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    margin: 5,
  },
  cardDisabled: {
    opacity: 0.75,
  },
  imageArea: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageInitial: {
    fontSize: 42,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.15)',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeIn: {
    backgroundColor: '#16A34A',
  },
  badgeLow: {
    backgroundColor: '#D97706',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  outOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cartControls: {
    position: 'absolute',
    bottom: 8,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnAdd: {
    backgroundColor: '#2563EB',
  },
  controlBtnAddDisabled: {
    backgroundColor: '#9CA3AF',
  },
  controlBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    lineHeight: 16,
  },
  controlBtnTextLight: {
    color: '#FFFFFF',
  },
  controlQty: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    minWidth: 16,
    textAlign: 'center',
  },
  info: {
    padding: 10,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 18,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  priceOut: {
    color: '#9CA3AF',
  },
});
