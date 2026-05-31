// ProductInfoCard.tsx — tanlangan mahsulot card

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './StockOutColors';
import type { StockLevel } from './StockOutTypes';

interface ProductInfoCardProps {
  readonly item: StockLevel;
}

function formatQty(qty: number): string {
  return qty % 1 === 0 ? String(qty) : qty.toFixed(2);
}

function ProductInfoCard({ item }: ProductInfoCardProps) {
  return (
    <View style={cardStyles.container}>
      <Ionicons name="cube-outline" size={18} color={C.primary} />
      <View style={cardStyles.info}>
        <Text style={cardStyles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={cardStyles.meta}>
          {item.warehouseName} · Qoldiq: {formatQty(item.totalQty)} dona
        </Text>
      </View>
    </View>
  );
}

export default React.memo(ProductInfoCard);

const cardStyles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             10,
    backgroundColor: C.bg,
    borderRadius:    12,
    padding:         14,
    borderWidth:     1,
    borderColor:     C.border,
    marginBottom:    16,
  },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontWeight: '700', color: C.text },
  meta: { fontSize: 12, color: C.secondary },
});
