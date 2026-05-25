import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { reportsApi, ProfitReport } from '../../api/reports.api';
import { useBranchStore } from '../../store/branch.store';
import { Colors, Radii, Shadows, Typography } from '../../config/theme';
import SkeletonList from '../../components/common/SkeletonList';
import PnLHeader from './PnLHeader';
import PnLKpiCard from './PnLKpiCard';
import PnLWaterfall from './PnLWaterfall';
import PnLExpenseBreakdown from './PnLExpenseBreakdown';
import {
  PeriodKey,
  PERIODS,
  formatAmount,
  formatFullAmount,
  getDateRange,
} from './pnl.utils';

const EMPTY_REPORT: ProfitReport = {
  revenue: 0,
  cogs: 0,
  grossProfit: 0,
  grossMarginPct: 0,
  totalExpenses: 0,
  netProfit: 0,
  expenseBreakdown: [],
};

export default function PnLScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const periodConfig = PERIODS.find((p) => p.key === period)!;
  const dateRange = useMemo(() => getDateRange(periodConfig.days), [periodConfig.days]);

  const { data, isLoading, isFetching, refetch } = useQuery<ProfitReport>({
    queryKey: ['profit-report', period, selectedBranchId],
    queryFn: () => reportsApi.getProfitReport(dateRange.from, dateRange.to),
    retry: false,
  });

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <PnLHeader onBack={() => navigation.goBack()} />
        <SkeletonList count={5} />
      </SafeAreaView>
    );
  }

  const report = data ?? EMPTY_REPORT;
  const isNetPositive = report.netProfit >= 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PnLHeader onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => { void handleRefresh(); }}
          />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          <PnLKpiCard
            label="Daromad"
            value={formatAmount(report.revenue)}
            subtitle="Revenue"
            color={Colors.primary}
            bgColor={Colors.primaryLight}
            icon="cash-outline"
          />
          <PnLKpiCard
            label="Tan narxi"
            value={formatAmount(report.cogs)}
            subtitle="COGS"
            color={Colors.orange}
            bgColor={Colors.orangeLight}
            icon="pricetag-outline"
          />
          <PnLKpiCard
            label="Yalpi foyda"
            value={formatAmount(report.grossProfit)}
            subtitle={`Margin: ${report.grossMarginPct.toFixed(1)}%`}
            color={Colors.success}
            bgColor={Colors.successLight}
            icon="trending-up-outline"
          />
          <PnLKpiCard
            label="Xarajatlar"
            value={formatAmount(report.totalExpenses)}
            subtitle="Expenses"
            color={Colors.danger}
            bgColor={Colors.dangerLight}
            icon="wallet-outline"
          />
        </View>

        {/* Net Profit */}
        <View style={[styles.netProfitCard, isNetPositive ? styles.netPositive : styles.netNegative]}>
          <View style={styles.netProfitLeft}>
            <Ionicons
              name={isNetPositive ? 'arrow-up-circle' : 'arrow-down-circle'}
              size={28}
              color={isNetPositive ? Colors.success : Colors.danger}
            />
            <View>
              <Text style={styles.netProfitLabel}>Sof foyda (Net Profit)</Text>
              <Text
                style={[
                  styles.netProfitValue,
                  { color: isNetPositive ? Colors.success : Colors.danger },
                ]}
              >
                {isNetPositive ? '+' : ''}{formatFullAmount(report.netProfit)}
              </Text>
            </View>
          </View>
        </View>

        <PnLWaterfall
          revenue={report.revenue}
          cogs={report.cogs}
          grossProfit={report.grossProfit}
          grossMarginPct={report.grossMarginPct}
          totalExpenses={report.totalExpenses}
          netProfit={report.netProfit}
        />

        <PnLExpenseBreakdown items={report.expenseBreakdown} />

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgApp },
  scrollContent: { paddingTop: 8 },
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgSurface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodText: { ...Typography.captionMedium, color: Colors.textSecondary },
  periodTextActive: { color: Colors.textWhite },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  netProfitCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: Radii.lg,
    padding: 16,
    ...Shadows.cardStrong,
  },
  netPositive: { backgroundColor: Colors.successLight, borderWidth: 1, borderColor: '#BBF7D0' },
  netNegative: { backgroundColor: Colors.dangerLight, borderWidth: 1, borderColor: '#FECACA' },
  netProfitLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  netProfitLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 2 },
  netProfitValue: { fontSize: 20, fontWeight: '800' },
  bottomPad: { height: 40 },
});
