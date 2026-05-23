// StockOutProductCard.tsx — mahsulot kartasi komponenti

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './StockOutColors';
import type { StockLevel } from './StockOutTypes';

type StockStatus = 'NORMAL' | 'KAM' | 'TUGAGAN';

function getStockStatus(item: StockLevel): StockStatus {
  if (item.totalQty <= 0) return 'TUGAGAN';
  if (item.minStockLevel !== null && item.totalQty <= item.minStockLevel) return 'KAM';
  return 'NORMAL';
}

const STATUS_STYLE: Record<StockStatus, { bg: string; text: string }> = {
  NORMAL:  { bg: '#F0FDF4', text: C.green },
  KAM:     { bg: '#FFFBEB', text: C.orange },
  TUGAGAN: { bg: '#FEF2F2', text: C.red },
};

interface StockOutProductCardProps {
  readonly item:     StockLevel;
  readonly onSelect: (item: StockLevel) => void;
}

export const StockOutProductCard = React.memo(function StockOutProductCard({
  item,
  onSelect,
}: StockOutProductCardProps) {
  const status   = getStockStatus(item);
  const statusSt = STATUS_STYLE[status];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onSelect(item)}
      activeOpacity={0.75}
    >
      {/* Top row: mahsulot nomi + status badge */}
      <View style={styles.topRow}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={[styles.badge, { backgroundColor: statusSt.bg }]}>
          <Text style={[styles.badgeText, { color: statusSt.text }]}>
            {status}
          </Text>
        </View>
      </View>

      {/* Ombor nomi */}
      <View style={styles.warehouseRow}>
        <Ionicons name="business-outline" size={13} color={C.muted} />
        <Text style={styles.warehouseText} numberOfLines={1}>
          {item.warehouseName || "Ombor noma'lum"}
        </Text>
      </View>

      {/* Bottom row: qoldiq + chiqarish tugmasi */}
      <View style={styles.bottomRow}>
        <View style={styles.qtyRow}>
          <Ionicons name="cube-outline" size={13} color={C.muted} />
          <Text style={styles.qtyLabel}>Qoldiq:</Text>
          <Text
            style={[
              styles.qtyValue,
              item.totalQty <= 0 && { color: C.red },
              item.minStockLevel !== null &&
                item.totalQty > 0 &&
                item.totalQty <= item.minStockLevel && { color: C.orange },
            ]}
          >
            {item.totalQty % 1 === 0
              ? String(item.totalQty)
              : item.totalQty.toFixed(2)}{' '}
            dona
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.selectBtn, item.totalQty <= 0 && styles.selectBtnDisabled]}
          onPress={() => onSelect(item)}
          activeOpacity={0.75}
          disabled={item.totalQty <= 0}
        >
          <Ionicons name="remove-circle-outline" size={14} color={C.white} />
          <Text style={styles.selectBtnText}>Chiqar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius:    14,
    padding:         14,
    marginHorizontal: 16,
    gap:             8,
    borderWidth:     1,
    borderColor:     C.border,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.05,
    shadowRadius:    4,
    elevation:       2,
  },
  topRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            8,
  },
  productName: {
    fontSize:   15,
    fontWeight: '700',
    color:      C.text,
    flex:       1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      6,
  },
  badgeText: {
    fontSize:   10,
    fontWeight: '800',
  },
  warehouseRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
  },
  warehouseText: {
    fontSize: 13,
    color:    C.secondary,
    flex:     1,
  },
  bottomRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginTop:      2,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    flex:          1,
  },
  qtyLabel: {
    fontSize: 13,
    color:    C.muted,
  },
  qtyValue: {
    fontSize:   13,
    fontWeight: '700',
    color:      C.text,
  },
  selectBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            4,
    backgroundColor: C.red,
    paddingHorizontal: 12,
    paddingVertical:  8,
    borderRadius:    8,
    minHeight:       36,
  },
  selectBtnDisabled: {
    backgroundColor: C.muted,
  },
  selectBtnText: {
    fontSize:   13,
    fontWeight: '700',
    color:      C.white,
  },
});
