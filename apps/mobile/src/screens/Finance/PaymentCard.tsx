import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { OrderStatus } from '@raos/types';
import { C, STATUS_STYLE, fmt, formatDate, formatTime, MONO } from './paymentsHistory.helpers';

// ─── PaymentCard ───────────────────────────────────────
interface PaymentCardProps {
  readonly orderNumber: number;
  readonly status: OrderStatus;
  readonly total: number;
  readonly createdAt: Date | string;
  readonly customerId: string | null;
}

export function PaymentCard({
  orderNumber,
  status,
  total,
  createdAt,
  customerId,
}: PaymentCardProps) {
  const s = STATUS_STYLE[status];
  const isReturn = status === 'RETURNED';

  return (
    <View style={cardStyles.card}>
      {/* Left: icon */}
      <View style={[cardStyles.cardIcon, { backgroundColor: s.bg }]}>
        <Ionicons
          name={status === 'COMPLETED' ? 'checkmark-circle-outline' : status === 'RETURNED' ? 'return-down-back-outline' : 'close-circle-outline'}
          size={20}
          color={s.color}
        />
      </View>

      {/* Middle: info */}
      <View style={cardStyles.cardBody}>
        <View style={cardStyles.cardTop}>
          <Text style={cardStyles.cardOrderNum}>
            #{String(orderNumber).padStart(4, '0')}
          </Text>
          <View style={[cardStyles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={[cardStyles.statusText, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>
        <View style={cardStyles.cardMeta}>
          <Ionicons name="time-outline" size={12} color={C.muted} />
          <Text style={cardStyles.cardMetaText}>{formatDate(createdAt)} {formatTime(createdAt)}</Text>
        </View>
        {customerId && (
          <View style={cardStyles.cardMeta}>
            <Ionicons name="person-outline" size={12} color={C.muted} />
            <Text style={cardStyles.cardMetaText} numberOfLines={1}>
              Mijoz: {customerId.slice(0, 8)}…
            </Text>
          </View>
        )}
      </View>

      {/* Right: amount */}
      <Text style={[cardStyles.cardAmount, { color: isReturn ? C.red : C.text }]}>
        {isReturn ? '−' : ''}{fmt(total)}
      </Text>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardOrderNum: {
    fontSize: 14,
    fontWeight: '800',
    color: C.primary,
    fontFamily: MONO,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 12, color: C.muted },
  cardAmount: { fontSize: 14, fontWeight: '800' },
});
