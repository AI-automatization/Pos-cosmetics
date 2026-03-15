import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RouteProp } from '@react-navigation/native';
import { ShiftsStackParamList } from '../../navigation/types';
import { useShiftDetail } from '../../hooks/useShifts';
import SkeletonList from '../../components/common/SkeletonList';
import ErrorView from '../../components/common/ErrorView';
import PaymentBreakdownChart from './PaymentBreakdownChart';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime, formatDuration } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  route: RouteProp<ShiftsStackParamList, 'ShiftDetail'>;
};

export default function ShiftDetailScreen({ route }: Props) {
  const { t } = useTranslation();
  const { shiftId } = route.params;
  const { data: shift, isLoading, isError, error, refetch } = useShiftDetail(shiftId);

  if (isLoading) return <SkeletonList count={4} />;
  if (isError || !shift) return <ErrorView error={error} onRetry={() => { void refetch(); }} />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Badge
            label={shift.status === 'open' ? t('shifts.open') : t('shifts.closed')}
            variant={shift.status === 'open' ? 'success' : 'neutral'}
          />
          <Text style={styles.branch}>{shift.branchName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.cashier}>{shift.cashierName}</Text>
          <Text style={styles.meta}>{t('shifts.opened')}: {formatDateTime(shift.openedAt)}</Text>
          {shift.closedAt && (
            <>
              <Text style={styles.meta}>{t('shifts.closed_at')}: {formatDateTime(shift.closedAt)}</Text>
              <Text style={styles.meta}>{t('shifts.duration')}: {formatDuration(shift.openedAt, shift.closedAt)}</Text>
            </>
          )}
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: t('shifts.revenue'), value: formatCurrency(shift.totalRevenue) },
            { label: t('shifts.orders'), value: String(shift.totalOrders) },
            { label: t('shifts.avgOrder'), value: formatCurrency(shift.avgOrderValue) },
            { label: t('shifts.refunds'), value: formatCurrency(shift.totalRefunds) },
            { label: t('shifts.voids'), value: formatCurrency(shift.totalVoids) },
            { label: t('shifts.discounts'), value: formatCurrency(shift.totalDiscounts) },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <PaymentBreakdownChart data={shift.paymentBreakdown} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  branch: { fontSize: 16, fontWeight: '600', color: '#374151' },
  section: { backgroundColor: '#fff', padding: 16, gap: 4, marginTop: 8 },
  cashier: { fontSize: 18, fontWeight: '700', color: '#111827' },
  meta: { fontSize: 14, color: '#6B7280' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  statItem: { width: '47%', padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8, gap: 4 },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
});
