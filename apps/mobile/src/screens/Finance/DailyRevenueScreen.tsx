import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports.api';
import ErrorView from '@/components/common/ErrorView';
import RevenueBarChart from './RevenueBarChart';
import { C, styles } from './DailyRevenueScreen.styles';

// ─── Period config ─────────────────────────────────────
type PeriodKey = '7d' | '30d' | '90d';

const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: '7d',  label: '7 kun',  days: 6  },
  { key: '30d', label: '30 kun', days: 29 },
  { key: '90d', label: '90 kun', days: 89 },
];

function getPeriodDates(days: number): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0]!;
  const from = new Date(now);
  from.setDate(now.getDate() - days);
  return { from: from.toISOString().split('T')[0]!, to };
}

// ─── Format helpers ────────────────────────────────────
function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' mlrd';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' mln';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + ' ming';
  return n.toString();
}

function fmt(n: number): string {
  const abs = Math.abs(Number(n));
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (Number(n) < 0 ? '-' : '') + formatted + ' UZS';
}

function fmtInt(n: number): string {
  const abs = Math.abs(Number(n));
  return (Number(n) < 0 ? '-' : '') + Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

// ─── DailyRevenueScreen ────────────────────────────────
interface Props {
  onClose?: () => void;
}

export default function DailyRevenueScreen({ onClose }: Props) {
  const navigation = useNavigation();
  const [period, setPeriod] = useState<PeriodKey>('30d');

  const days = PERIODS.find((p) => p.key === period)!.days;
  const { from, to } = useMemo(() => getPeriodDates(days), [days]);

  const { data: daily = [], isLoading, error, refetch } = useQuery({
    queryKey: ['daily-revenue', from, to],
    queryFn: () => reportsApi.getDailyRevenue(from, to),
    staleTime: 5 * 60_000,
  });

  // Summary stats
  const totalRevenue = useMemo(() => daily.reduce((s, d) => s + d.revenue, 0), [daily]);
  const totalOrders  = useMemo(() => daily.reduce((s, d) => s + d.orderCount, 0), [daily]);
  const avgPerDay    = daily.length > 0 ? totalRevenue / daily.length : 0;

  // Sort by date
  const sorted = useMemo(
    () => [...daily].sort((a, b) => a.date.localeCompare(b.date)),
    [daily],
  );

  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

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
        <Text style={styles.headerTitle}>Kunlik savdo</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Period pills */}
        <View style={styles.pillsRow}>
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
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
        ) : (
          <>
            {/* Summary row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Jami tushum</Text>
                <Text style={styles.summaryValue}>{fmtShort(totalRevenue)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Buyurtmalar</Text>
                <Text style={styles.summaryValue}>{fmtInt(totalOrders)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>O'rtacha/kun</Text>
                <Text style={styles.summaryValue}>{fmtShort(avgPerDay)}</Text>
              </View>
            </View>

            {/* Bar chart + Data table */}
            {sorted.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>KUNLIK GRAFIK</Text>
                <View style={styles.chartCard}>
                  <RevenueBarChart data={sorted} />
                </View>

                <Text style={styles.sectionLabel}>BATAFSIL JADVAL</Text>
                <View style={styles.tableCard}>
                  {/* Table header */}
                  <View style={[styles.tableRow, styles.tableHead]}>
                    <Text style={[styles.tableCell, styles.tableHeadText, styles.colName]}>Sana</Text>
                    <Text style={[styles.tableCell, styles.tableHeadText, styles.colRevenue]}>Tushum</Text>
                    <Text style={[styles.tableCell, styles.tableHeadText, styles.colCount]}>Buyurtma</Text>
                  </View>
                  {sorted.slice().reverse().map((item, idx) => (
                    <View key={item.date}>
                      {idx > 0 && <View style={styles.rowDivider} />}
                      <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.colName]}>{dayLabel(item.date)}</Text>
                        <Text style={[styles.tableCell, styles.tableCellRevenue, styles.colRevenue]}>
                          {fmt(item.revenue)}
                        </Text>
                        <Text style={[styles.tableCell, styles.colCountMuted]}>
                          {item.orderCount} ta
                        </Text>
                      </View>
                    </View>
                  ))}
                  {/* Total row */}
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalCell, styles.colName]}>Jami</Text>
                    <Text style={[styles.totalCell, styles.totalColRevenue]}>
                      {fmt(totalRevenue)}
                    </Text>
                    <Text style={[styles.totalCell, styles.colCount]}>
                      {totalOrders} ta
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.empty}>
                <Ionicons name="bar-chart-outline" size={44} color={C.muted} />
                <Text style={styles.emptyText}>Bu davr uchun ma'lumot yo'q</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
