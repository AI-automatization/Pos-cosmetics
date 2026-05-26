import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Order, OrderStatus } from '@raos/types';
import { Colors, Radii, Shadows } from '../../config/theme';

interface StatusConfig {
  readonly label: string;
  readonly color: string;
  readonly bg: string;
}

const STATUS_CFG: Record<OrderStatus, StatusConfig> = {
  COMPLETED: { label: 'Bajarilgan',   color: Colors.success,       bg: Colors.successLight },
  RETURNED:  { label: 'Qaytarilgan',  color: Colors.warning,       bg: Colors.warningLight },
  VOIDED:    { label: 'Bekor',        color: Colors.danger,        bg: Colors.dangerLight },
};

interface SalesOrderRowProps {
  readonly item: Order;
  readonly onPress: (orderId: string, orderNumber: number) => void;
}

export default React.memo(function SalesOrderRow({ item, onPress }: SalesOrderRowProps) {
  const cfg = STATUS_CFG[item.status] ?? STATUS_CFG.COMPLETED;
  const date = new Date(item.createdAt).toLocaleDateString('uz-UZ');
  const total = Number(item.total).toLocaleString('uz-UZ');

  const handlePress = React.useCallback(() => {
    onPress(item.id, item.orderNumber);
  }, [item.id, item.orderNumber, onPress]);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Buyurtma #${item.orderNumber}, ${total} so'm, ${cfg.label}`}
    >
      <View style={styles.left}>
        <Text style={styles.number}>#{item.orderNumber}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.total}>{total} so'm</Text>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 14,
    borderRadius: Radii.lg,
    ...Shadows.card,
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  number: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  total: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  badge: {
    borderRadius: Radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
