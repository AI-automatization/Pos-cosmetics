import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports.api';
import ErrorView from '@/components/common/ErrorView';
import { useScreenProtection } from '../../hooks/useScreenProtection';
import { KpiCard, TableRow, SegmentBar } from './PnLComponents';
import { styles, C } from './PnLScreen.styles';

// ─── Period config ─────────────────────────────────────
type PeriodKey = 'today' | '7d' | '30d' | '90d' | '1y';

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Bugun' },
  { key: '7d',    label: '7 kun' },
  { key: '30d',   label: '30 kun' },
  { key: '90d',   label: '90 kun' },
  { key: '1y',    label: '1 yil' },
];

function getPeriodDates(key: PeriodKey): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0]!;
  const from = new Date(now);
  switch (key) {
    case 'today': from.setHours(0, 0, 0, 0); break;
    case '7d':    from.setDate(now.getDate() - 6); break;
    case '30d':   from.setDate(now.getDate() - 29); break;
    case '90d':   from.setDate(now.getDate() - 89); break;
    case '1y':    from.setFullYear(now.getFullYear() - 1); break;
  }
  return { from: from.toISOString().split('T')[0]!, to };
}

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number): string {
  const abs = Math.abs(Number(n));
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (Number(n) < 0 ? '-' : '') + formatted + ' UZS';
}

function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' mlrd';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' mln';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + ' ming';
  return n.toString();
}

// ─── PnLScreen ─────────────────────────────────────────
interface Props {
  onClose?: () => void;
}

export default function PnLScreen({ onClose }: Props) {
  useScreenProtection();
  const navigation = useNavigation();
  const [period, setPeriod] = useState<PeriodKey>('30d');

  const { from, to } = useMemo(() => getPeriodDates(period), [period]);

  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-summary', from, to],
    queryFn: () => reportsApi.getSalesSummary(from, to),
    staleTime: 5 * 60_000,
  });

  // ── Derived P&L values ─────────────────────────────
  const grossRevenue = summary?.orders.grossRevenue ?? 0;
  const discount     = summary?.orders.totalDiscount ?? 0;
  const returnsAmt   = summary?.returns.total ?? 0;
  const netRevenue   = summary?.netRevenue ?? 0;

  // COGS not available from this endpoint — show 0 until API is ready
  const cogs         = 0;
  const grossProfit  = netRevenue - cogs;
  const grossMargin  = netRevenue > 0 ? Math.round((grossProfit / netRevenue) * 100) : 0;

  // Segment bar: netRevenue = COGS + grossProfit
  const segments = [
    { value: cogs,        color: C.orange },
    { value: Math.max(0, grossProfit), color: C.green },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => (onClose ? onClose() : navigation.goBack())}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Foyda va Zarar</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Period selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          {PERIODS.map((p) => {
            const active = p.key === period;
            return (
              <TouchableOpacity
                key={p.key}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setPeriod(p.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
        ) : error ? (
          <ErrorView error={error} onRetry={() => void refetch()} />
        ) : !summary ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Ma'lumot yo'q</Text>
          </View>
        ) : (
          <>
            {/* KPI cards 2x2 */}
            <Text style={styles.sectionLabel}>ASOSIY KO'RSATKICHLAR</Text>
            <View style={styles.kpiGrid}>
              <KpiCard
                label="Tushum"
                value={fmtShort(netRevenue)}
                color={C.primary}
                iconName="cash-outline"
                iconBg="#EFF6FF"
              />
              <KpiCard
                label="Yalpi foyda"
                value={fmtShort(grossProfit)}
                sub={grossMargin !== 0 ? `${grossMargin}% marja` : undefined}
                color={C.green}
                iconName="trending-up-outline"
                iconBg="#F0FDF4"
              />
              <KpiCard
                label="Tannarx"
                value={fmtShort(cogs)}
                color={C.orange}
                iconName="cube-outline"
                iconBg="#FFFBEB"
              />
              <KpiCard
                label="Sof daromad"
                value={fmtShort(grossProfit)}
                sub={grossMargin !== 0 ? `${grossMargin}%` : undefined}
                color={grossProfit >= 0 ? C.green : C.red}
                iconName="wallet-outline"
                iconBg={grossProfit >= 0 ? '#F0FDF4' : '#FEF2F2'}
              />
            </View>

            {/* P&L breakdown table */}
            <Text style={styles.sectionLabel}>P&L JADVALI</Text>
            <View style={styles.tableCard}>
              {/* Daromad */}
              <View style={styles.tableSectionHeader}>
                <Ionicons name="trending-up-outline" size={14} color={C.green} />
                <Text style={styles.tableSectionTitle}>DAROMAD</Text>
              </View>
              <TableRow label="Yalpi tushum"      value={fmt(grossRevenue)} />
              <TableRow label="- Chegirmalar"      value={`-${fmt(discount)}`}  indent color={C.orange} />
              <TableRow label="- Qaytarishlar"     value={`-${fmt(returnsAmt)}`} indent color={C.red} />
              <TableRow
                label="Sof tushum"
                value={fmt(netRevenue)}
                bold
                color={C.primary}
                divider
              />

              <View style={[styles.tableSectionHeader, styles.tableSectionHeaderSpaced]}>
                <Ionicons name="remove-circle-outline" size={14} color={C.orange} />
                <Text style={styles.tableSectionTitle}>XARAJATLAR</Text>
              </View>
              <TableRow label="Tannarx (COGS)"     value={fmt(cogs)} />
              <TableRow label="Operatsion xarajat" value={fmt(0)} indent color={C.muted} />
              <TableRow
                label="Jami xarajat"
                value={fmt(cogs)}
                bold
                color={C.orange}
                divider
              />

              <View style={styles.netRow}>
                <Text style={styles.netLabel}>SOF DAROMAD</Text>
                <Text style={[styles.netValue, { color: grossProfit >= 0 ? C.green : C.red }]}>
                  {grossProfit >= 0 ? '' : '-'}{fmt(Math.abs(grossProfit))}
                </Text>
              </View>
            </View>

            {/* Segment bar + legend */}
            <Text style={styles.sectionLabel}>TARKIB</Text>
            <View style={styles.segCard}>
              <SegmentBar segments={segments} />
              <View style={styles.legend}>
                {[
                  { color: C.green,  label: 'Yalpi foyda', value: grossProfit },
                  { color: C.orange, label: 'Tannarx',     value: cogs },
                ].map((item) => (
                  <View key={item.label} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendLabel}>{item.label}</Text>
                    <Text style={[styles.legendValue, { color: item.color }]}>
                      {fmtShort(item.value)}
                    </Text>
                  </View>
                ))}
              </View>

              {netRevenue === 0 && (
                <View style={styles.noDataRow}>
                  <Ionicons name="information-circle-outline" size={16} color={C.muted} />
                  <Text style={styles.noDataText}>Ma'lumot topilmadi yoki COGS API ulash kerak</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
