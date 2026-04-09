// Ombor screen — ProductCard component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LowStockItem } from '../../api/inventory.api';
import { C } from './OmborColors';
import { getStatus, STATUS_CFG } from './OmborTypes';

interface ProductCardProps {
  readonly item: LowStockItem;
}

export default function OmborProductCard({ item }: ProductCardProps) {
  const status = getStatus(item);
  const cfg    = STATUS_CFG[status];

  return (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: cfg.iconBg }]}>
        <Ionicons name="cube-outline" size={22} color={cfg.iconColor} />
      </View>
      <View style={styles.cardMiddle}>
        <Text style={styles.cardName} numberOfLines={2}>{item.productName}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={C.muted} />
          <Text style={styles.warehouseText}>{item.warehouseName}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.stockText, { color: cfg.stockColor }]}>
          {item.stock} / min {item.minStockLevel}
        </Text>
        <View style={[styles.badge, { backgroundColor: cfg.badgeBg }]}>
          <Text style={[styles.badgeText, { color: cfg.badgeText }]}>{cfg.label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMiddle: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  warehouseText: {
    fontSize: 12,
    color: C.muted,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  stockText: {
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
