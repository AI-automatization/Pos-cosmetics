// StockMovementCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './StockMovementColors';
import { TYPE_CFG } from './StockMovementTypes';
import type { StockMovement } from './StockMovementTypes';

interface Props {
  readonly item: StockMovement;
}

export const StockMovementCard = React.memo(function StockMovementCard({
  item,
}: Props) {
  const cfg = TYPE_CFG[item.type];
  const productName   = item.product?.name ?? "Noma'lum mahsulot";
  const warehouseName = item.warehouse?.name ?? "Noma'lum ombor";
  const userName = item.user
    ? `${item.user.firstName} ${item.user.lastName}`
    : null;

  const dateStr = new Date(item.createdAt).toLocaleDateString('uz-UZ', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });

  const qtyColor =
    cfg.sign === '+' ? C.green : cfg.sign === '-' ? C.red : C.yellow;

  const qtyDisplay =
    cfg.sign === '~'
      ? `${item.quantity} dona`
      : `${cfg.sign}${item.quantity} dona`;

  return (
    <View style={styles.card}>
      {/* Top row: badge + qty */}
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.badgeText, { color: cfg.text }]}>
            {cfg.label}
          </Text>
        </View>
        <Text style={[styles.qty, { color: qtyColor }]}>{qtyDisplay}</Text>
      </View>

      {/* Product name */}
      <Text style={styles.productName} numberOfLines={1}>
        {productName}
      </Text>

      {/* Warehouse */}
      <View style={styles.row}>
        <Ionicons name="business-outline" size={12} color={C.muted} />
        <Text style={styles.meta} numberOfLines={1}>
          {warehouseName}
        </Text>
      </View>

      {/* Bottom row: date + user */}
      <View style={styles.bottomRow}>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={12} color={C.muted} />
          <Text style={styles.meta}>{dateStr}</Text>
        </View>
        {userName !== null && (
          <View style={styles.row}>
            <Ionicons name="person-outline" size={12} color={C.muted} />
            <Text style={styles.meta} numberOfLines={1}>
              {userName}
            </Text>
          </View>
        )}
      </View>

      {/* Note */}
      {item.note !== null && item.note.length > 0 ? (
        <Text style={styles.note} numberOfLines={2}>
          {item.note}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius:    12,
    padding:         14,
    marginHorizontal: 16,
    gap:             6,
    borderWidth:     1,
    borderColor:     C.border,
    elevation:       1,
  },
  topRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      6,
  },
  badgeText: {
    fontSize:   11,
    fontWeight: '700',
  },
  qty: {
    fontSize:   15,
    fontWeight: '800',
  },
  productName: {
    fontSize:   14,
    fontWeight: '700',
    color:      C.text,
  },
  bottomRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    flexWrap:       'wrap',
    gap:            4,
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  meta: {
    fontSize: 12,
    color:    C.secondary,
    flex:     1,
  },
  note: {
    fontSize:       12,
    color:          C.muted,
    fontStyle:      'italic',
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop:     6,
    marginTop:      2,
  },
});
