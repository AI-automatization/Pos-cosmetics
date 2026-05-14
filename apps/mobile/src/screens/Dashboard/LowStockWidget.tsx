import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LowStockItem } from '../../api/inventory.api';

interface LowStockWidgetProps {
  readonly items: LowStockItem[];
  readonly onViewAll: () => void;
}

const MAX_VISIBLE = 5;

function LowStockWidget({ items, onViewAll }: LowStockWidgetProps) {
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.stock === 0 && b.stock !== 0) return -1;
      if (a.stock !== 0 && b.stock === 0) return 1;
      return a.stock - b.stock;
    });
  }, [items]);

  if (items.length === 0) return null;

  const visible = sorted.slice(0, MAX_VISIBLE);
  const hasMore = items.length > MAX_VISIBLE;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={colors.orange}
            style={styles.icon}
          />
          <Text style={styles.title}>Kam zaxira</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{items.length}</Text>
          </View>
        </View>
      </View>

      {/* Rows */}
      {visible.map((item, index) => {
        const isOutOfStock = item.stock <= 0;
        const stockColor = isOutOfStock ? colors.red : colors.orange;
        const isLast = index === visible.length - 1;

        return (
          <View
            key={`${item.productId}-${item.warehouseId}`}
            style={[styles.row, !isLast && styles.rowBorder]}
          >
            {/* Left: product info */}
            <View style={styles.rowLeft}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.productName}
              </Text>
              <Text style={styles.sku} numberOfLines={1}>
                {item.sku}
              </Text>
            </View>

            {/* Right: stock info */}
            <View style={styles.rowRight}>
              <View style={styles.stockRow}>
                <Text style={[styles.stockValue, { color: stockColor }]}>
                  {item.stock}
                </Text>
                <Text style={styles.stockMax}>
                  {'/' + item.minStockLevel}
                </Text>
              </View>
              <Text style={styles.warehouseName} numberOfLines={1}>
                {item.warehouseName}
              </Text>
            </View>
          </View>
        );
      })}

      {/* View All */}
      {hasMore && (
        <TouchableOpacity
          onPress={onViewAll}
          activeOpacity={0.7}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>Barchasini ko'rish →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const colors = {
  text: '#111827',
  muted: '#9CA3AF',
  secondary: '#6B7280',
  orange: '#D97706',
  red: '#DC2626',
  blue: '#2563EB',
  border: '#E5E7EB',
  lightBorder: '#F3F4F6',
  orangeTint: '#FFF7ED',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  badge: {
    backgroundColor: colors.orangeTint,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.orange,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightBorder,
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  sku: {
    fontSize: 12,
    color: colors.muted,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stockValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  stockMax: {
    fontSize: 12,
    color: colors.muted,
    marginLeft: 1,
  },
  warehouseName: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
    maxWidth: 100,
  },
  viewAllButton: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.blue,
    textAlign: 'right',
  },
});

export default memo(LowStockWidget);
