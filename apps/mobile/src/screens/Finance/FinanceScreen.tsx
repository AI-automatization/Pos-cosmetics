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
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { reportsApi } from '../../api/reports.api';
import type { FinanceStackParamList } from '../../navigation/types';
import ErrorView from '@/components/common/ErrorView';
import { styles, C } from './FinanceScreen.styles';
import { StatCard, NavCard } from './FinanceCards';

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

// ─── FinanceScreen ─────────────────────────────────────
export default function FinanceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<FinanceStackParamList, 'FinanceMain'>>();
  const [period, setPeriod] = useState<PeriodKey>('30d');

  const { from, to } = useMemo(() => getPeriodDates(period), [period]);

  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-summary', from, to],
    queryFn: () => reportsApi.getSalesSummary(from, to),
    staleTime: 5 * 60_000,
  });

  // Derived values
  const tushum       = summary?.netRevenue ?? 0;
  const grossRevenue = summary?.orders.grossRevenue ?? 0;
  const discount     = summary?.orders.totalDiscount ?? 0;
  const returns      = summary?.returns.total ?? 0;
  const orderCount   = summary?.orders.count ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Moliya</Text>
          <Text style={styles.headerSub}>Moliyaviy ko'rsatkichlar</Text>
        </View>
        <View style={[styles.headerIcon, styles.headerIconBlue]}>
          <Ionicons name="bar-chart-outline" size={20} color={C.primary} />
        </View>
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

        {/* Summary cards */}
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
            <Text style={styles.sectionLabel}>ASOSIY KO'RSATKICHLAR</Text>
            <View style={styles.cardGrid}>
              <StatCard
                label="Tushum"
                value={fmtShort(tushum)}
                subValue={orderCount > 0 ? `${orderCount} ta buyurtma` : undefined}
                iconName="trending-up-outline"
                iconColor={C.green}
                iconBg="#F0FDF4"
              />
              <StatCard
                label="Yalpi tushum"
                value={fmtShort(grossRevenue)}
                subValue={discount > 0 ? `-${fmtShort(discount)} chegirma` : undefined}
                iconName="cash-outline"
                iconColor={C.primary}
                iconBg="#EFF6FF"
              />
              <StatCard
                label="Qaytarishlar"
                value={fmtShort(returns)}
                subValue={summary?.returns.count ? `${summary.returns.count} ta` : undefined}
                iconName="return-down-back-outline"
                iconColor={C.red}
                iconBg="#FEF2F2"
              />
              <StatCard
                label="Chegirmalar"
                value={fmtShort(discount)}
                subValue={discount > 0 && grossRevenue > 0
                  ? `${Math.round((discount / grossRevenue) * 100)}%`
                  : undefined}
                iconName="pricetag-outline"
                iconColor={C.orange}
                iconBg="#FFFBEB"
              />
            </View>

            {/* Payment breakdown */}
            {summary && summary.paymentBreakdown.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>TO'LOV USULLARI</Text>
                <View style={styles.breakdownCard}>
                  {summary.paymentBreakdown.map((item, idx) => (
                    <View key={item.method}>
                      {idx > 0 && <View style={styles.breakdownDivider} />}
                      <View style={styles.breakdownRow}>
                        <View style={styles.breakdownLeft}>
                          <View style={styles.breakdownDot} />
                          <Text style={styles.breakdownMethod}>{item.method}</Text>
                        </View>
                        <Text style={styles.breakdownAmount}>{fmt(item.amount)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* Navigation cards */}
        <Text style={styles.sectionLabel}>MOLIYA BO'LIMLARI</Text>
        <View style={styles.navGrid}>
          <NavCard
            label="P&L hisoboti"
            iconName="analytics-outline"
            iconColor={C.primary}
            iconBg="#EFF6FF"
            onPress={() => navigation.navigate('PnL')}
          />
          <NavCard
            label="Xarajatlar"
            iconName="receipt-outline"
            iconColor={C.orange}
            iconBg="#FFFBEB"
            onPress={() => navigation.navigate('Expenses')}
          />
          <NavCard
            label="To'lovlar tarixi"
            iconName="card-outline"
            iconColor={C.green}
            iconBg="#F0FDF4"
            onPress={() => navigation.navigate('PaymentsHistory')}
          />
          <NavCard
            label="Hisobotlar"
            iconName="document-text-outline"
            iconColor="#7C3AED"
            iconBg="#F5F3FF"
            onPress={() => navigation.navigate('ReportsHub')}
          />
          <NavCard
            label="Kunlik daromad"
            iconName="calendar-outline"
            iconColor={C.green}
            iconBg="#F0FDF4"
            onPress={() => navigation.navigate('DailyRevenue')}
          />
          <NavCard
            label="Top mahsulotlar"
            iconName="star-outline"
            iconColor={C.orange}
            iconBg="#FFFBEB"
            onPress={() => navigation.navigate('TopProducts')}
          />
          <NavCard
            label="Nasiya eskirishi"
            iconName="time-outline"
            iconColor={C.red}
            iconBg="#FEF2F2"
            onPress={() => navigation.navigate('NasiyaAging')}
          />
          <NavCard
            label="Smena hisobotlari"
            iconName="people-outline"
            iconColor={C.primary}
            iconBg="#EFF6FF"
            onPress={() => navigation.navigate('ShiftReports')}
          />
          <NavCard
            label="Valyuta kurslari"
            iconName="globe-outline"
            iconColor="#0891B2"
            iconBg="#ECFEFF"
            onPress={() => navigation.navigate('ExchangeRates')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
