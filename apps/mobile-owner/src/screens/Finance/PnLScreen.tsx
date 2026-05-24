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

type PeriodKey = '7d' | '30d' | '90d' | '365d';

const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: '7d', label: '7 kun', days: 7 },
  { key: '30d', label: '30 kun', days: 30 },
  { key: '90d', label: '90 kun', days: 90 },
  { key: '365d', label: '1 yil', days: 365 },
];

const EXPENSE_COLORS: Record<string, string> = {
  RENT: '#7C3AED',
  SALARY: '#2563EB',
  DELIVERY: '#EA580C',
  UTILITIES: '#0891B2',
  OTHER: '#64748B',
};

function getExpenseColor(category: string): string {
  return EXPENSE_COLORS[category.toUpperCase()] ?? Colors.textSecondary;
}

function getExpenseLabel(category: string): string {
  const labels: Record<string, string> = {
    RENT: 'Ijara',
    SALARY: 'Maosh',
    DELIVERY: 'Yetkazish',
    UTILITIES: 'Kommunal',
    OTHER: 'Boshqa',
  };
  return labels[category.toUpperCase()] ?? category;
}

function formatAmount(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toLocaleString('uz-UZ');
}

function formatFullAmount(amount: number): string {
  return `${amount.toLocaleString('uz-UZ')} UZS`;
}

function getDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split('T')[0] ?? '',
    to: to.toISOString().split('T')[0] ?? '',
  };
}

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
        <Header onBack={() => navigation.goBack()} />
        <SkeletonList count={5} />
      </SafeAreaView>
    );
  }

  const report = data ?? {
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    grossMarginPct: 0,
    totalExpenses: 0,
    netProfit: 0,
    expenseBreakdown: [],
  };

  const isNetPositive = report.netProfit >= 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header onBack={() => navigation.goBack()} />
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
          <KpiCard
            label="Daromad"
            value={formatAmount(report.revenue)}
            subtitle="Revenue"
            color={Colors.primary}
            bgColor={Colors.primaryLight}
            icon="cash-outline"
          />
          <KpiCard
            label="Tan narxi"
            value={formatAmount(report.cogs)}
            subtitle="COGS"
            color={Colors.orange}
            bgColor={Colors.orangeLight}
            icon="pricetag-outline"
          />
          <KpiCard
            label="Yalpi foyda"
            value={formatAmount(report.grossProfit)}
            subtitle={`Margin: ${report.grossMarginPct.toFixed(1)}%`}
            color={Colors.success}
            bgColor={Colors.successLight}
            icon="trending-up-outline"
          />
          <KpiCard
            label="Xarajatlar"
            value={formatAmount(report.totalExpenses)}
            subtitle="Expenses"
            color={Colors.danger}
            bgColor={Colors.dangerLight}
            icon="wallet-outline"
          />
        </View>

        {/* Net Profit — full width */}
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

        {/* Waterfall Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foyda tarkibi</Text>
          <View style={styles.waterfallCard}>
            <WaterfallRow label="Daromad" amount={report.revenue} type="positive" />
            <WaterfallRow label="Tan narxi (COGS)" amount={-report.cogs} type="negative" />
            <WaterfallRow
              label="Yalpi foyda"
              amount={report.grossProfit}
              type="subtotal"
              suffix={`${report.grossMarginPct.toFixed(1)}%`}
            />
            <WaterfallRow label="Xarajatlar" amount={-report.totalExpenses} type="negative" />
            <WaterfallRow
              label="Sof foyda"
              amount={report.netProfit}
              type="total"
              isLast
            />
          </View>
        </View>

        {/* Expense Breakdown */}
        {report.expenseBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Xarajatlar taqsimoti</Text>
            <View style={styles.expenseCard}>
              {report.expenseBreakdown.map((item) => (
                <View key={item.category} style={styles.expenseRow}>
                  <View style={styles.expenseLeft}>
                    <View
                      style={[
                        styles.expenseDot,
                        { backgroundColor: getExpenseColor(item.category) },
                      ]}
                    />
                    <Text style={styles.expenseLabel}>{getExpenseLabel(item.category)}</Text>
                  </View>
                  <View style={styles.expenseRight}>
                    <Text style={styles.expenseAmount}>{formatFullAmount(item.amount)}</Text>
                    <Text style={styles.expensePct}>{item.pct.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.expenseBarTrack}>
                    <View
                      style={[
                        styles.expenseBarFill,
                        {
                          width: `${Math.min(item.pct, 100)}%`,
                          backgroundColor: getExpenseColor(item.category),
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Sub-components ---------- */

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Foyda va zarar (P&L)</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function KpiCard({
  label,
  value,
  subtitle,
  color,
  bgColor,
  icon,
}: {
  label: string;
  value: string;
  subtitle: string;
  color: string;
  bgColor: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={[styles.kpiCard, { borderLeftColor: color }]}>
      <View style={[styles.kpiIconWrap, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value} UZS</Text>
      <Text style={[styles.kpiSubtitle, { color }]}>{subtitle}</Text>
    </View>
  );
}

function WaterfallRow({
  label,
  amount,
  type,
  suffix,
  isLast = false,
}: {
  label: string;
  amount: number;
  type: 'positive' | 'negative' | 'subtotal' | 'total';
  suffix?: string;
  isLast?: boolean;
}) {
  const isSubtotalOrTotal = type === 'subtotal' || type === 'total';
  const amountColor =
    type === 'negative'
      ? Colors.danger
      : type === 'total'
        ? amount >= 0
          ? Colors.success
          : Colors.danger
        : type === 'subtotal'
          ? Colors.primary
          : Colors.success;

  const sign = amount >= 0 ? '+' : '';

  return (
    <View
      style={[
        styles.waterfallRow,
        isSubtotalOrTotal && styles.waterfallSubtotalRow,
        !isLast && styles.waterfallRowBorder,
      ]}
    >
      <Text
        style={[
          styles.waterfallLabel,
          isSubtotalOrTotal && styles.waterfallLabelBold,
        ]}
      >
        {isSubtotalOrTotal ? '= ' : '  '}
        {label}
        {suffix ? ` (${suffix})` : ''}
      </Text>
      <Text
        style={[
          styles.waterfallAmount,
          { color: amountColor },
          isSubtotalOrTotal && styles.waterfallAmountBold,
        ]}
      >
        {sign}{formatFullAmount(amount)}
      </Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.card,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.primary,
    flex: 1,
  },
  headerSpacer: { width: 34 },
  scrollContent: {
    paddingTop: 8,
  },

  /* Period selector */
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
  periodText: {
    ...Typography.captionMedium,
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.textWhite,
  },

  /* KPI Grid */
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 10,
  },
  kpiCard: {
    width: '47%',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 14,
    gap: 4,
    borderLeftWidth: 4,
    ...Shadows.card,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  kpiSubtitle: {
    ...Typography.caption,
    fontWeight: '600',
  },

  /* Net Profit Card */
  netProfitCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: Radii.lg,
    padding: 16,
    ...Shadows.cardStrong,
  },
  netPositive: {
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  netNegative: {
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  netProfitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  netProfitLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  netProfitValue: {
    fontSize: 20,
    fontWeight: '800',
  },

  /* Sections */
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  /* Waterfall */
  waterfallCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  waterfallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  waterfallRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  waterfallSubtotalRow: {
    backgroundColor: Colors.bgSubtle,
  },
  waterfallLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  waterfallLabelBold: {
    fontWeight: '700',
  },
  waterfallAmount: {
    ...Typography.bodyMedium,
    textAlign: 'right',
  },
  waterfallAmountBold: {
    fontWeight: '700',
    fontSize: 15,
  },

  /* Expense breakdown */
  expenseCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 16,
    gap: 14,
    ...Shadows.card,
  },
  expenseRow: {
    gap: 6,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expenseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  expenseLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  expenseRight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 18,
  },
  expenseAmount: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  expensePct: {
    ...Typography.captionMedium,
    color: Colors.textSecondary,
  },
  expenseBarTrack: {
    height: 6,
    backgroundColor: Colors.bgSubtle,
    borderRadius: 3,
    marginLeft: 18,
    overflow: 'hidden',
  },
  expenseBarFill: {
    height: 6,
    borderRadius: 3,
  },

  bottomPad: { height: 40 },
});
