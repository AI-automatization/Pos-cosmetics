import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Shift } from '../../api/shifts.api';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime, formatDuration } from '../../utils/formatDate';
import { Colors, Radii, Shadows } from '../../config/theme';

interface ShiftRowProps {
  item: Shift;
  onPress: (shiftId: string) => void;
}

export default function ShiftRow({ item, onPress }: ShiftRowProps) {
  const { t } = useTranslation();
  const isOpen = item.status === 'open';

  return (
    <TouchableOpacity
      style={[styles.card, isOpen && styles.cardOpen]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
    >
      {/* Open shift accent bar */}
      {isOpen && <View style={styles.openBar} />}

      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Badge
              label={isOpen ? t('shifts.open') : t('shifts.closed')}
              variant={isOpen ? 'success' : 'neutral'}
            />
            <Text style={styles.branch}>{item.branchName}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </View>

        <Text style={styles.cashier}>{t('shifts.cashier')}: {item.cashierName}</Text>
        <Text style={styles.meta}>{formatDateTime(item.openedAt)}</Text>
        {item.closedAt && (
          <Text style={styles.meta}>{t('shifts.duration')}: {formatDuration(item.openedAt, item.closedAt)}</Text>
        )}

        <View style={styles.divider} />
        <View style={styles.stats}>
          <View>
            <Text style={styles.statLabel}>{t('shifts.revenue')}</Text>
            <Text style={styles.revenue}>{formatCurrency(item.totalRevenue)}</Text>
          </View>
          <View style={styles.statRight}>
            <Text style={styles.statLabel}>{t('shifts.orders')}</Text>
            <Text style={styles.orders}>{item.totalOrders}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    ...Shadows.card,
  },
  cardOpen: {
    borderWidth: 1,
    borderColor: Colors.successLight,
  },
  openBar: {
    width: 4,
    backgroundColor: Colors.success,
    alignSelf: 'stretch',
  },
  inner: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  branch: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  cashier: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  meta: { fontSize: 12, color: Colors.textMuted },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
  statRight: { alignItems: 'flex-end' },
  revenue: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  orders: { fontSize: 15, fontWeight: '700', color: Colors.primary },
});
