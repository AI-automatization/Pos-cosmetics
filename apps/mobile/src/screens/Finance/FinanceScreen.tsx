import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports.api';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
  red:     '#DC2626',
  orange:  '#D97706',
};

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
  return n.toLocaleString('ru-RU') + ' UZS';
}

function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' mlrd';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1) + ' mln';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + ' ming';
  return n.toString();
}

// ─── StatCard ──────────────────────────────────────────
function StatCard({
  label,
  value,
  subValue,
  iconName,
  iconColor,
  iconBg,
}: {
  label: string;
  value: string;
  subValue?: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subValue ? <Text style={styles.statSub}>{subValue}</Text> : null}
    </View>
  );
}

// ─── NavCard ───────────────────────────────────────────
function NavCard({
  label,
  iconName,
  iconColor,
  iconBg,
  onPress,
}: {
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.navCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.navIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <Text style={styles.navLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={14} color={C.muted} style={styles.navChevron} />
    </TouchableOpacity>
  );
}

// ─── FinanceScreen ─────────────────────────────────────
export default function FinanceScreen() {
  const [period, setPeriod] = useState<PeriodKey>('30d');

  const { from, to } = useMemo(() => getPeriodDates(period), [period]);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['sales-summary', from, to],
    queryFn: () => reportsApi.getSalesSummary(from, to),
    staleTime: 5 * 60_000,
  });

  // Derived values
  const tushum       = summary?.netRevenue ?? 0;
  const grossRevenue = summary?.orders.grossRevenue ?? 0;
  const discount     = summary?.orders.totalDiscount ?? 0;
  const returns      = summary?.returns.total ?? 0;
  // Tannarx & foyda estimated: no COGS API on this endpoint
  // Using grossRevenue as tushum proxy and netRevenue for display
  const orderCount   = summary?.orders.count ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Moliya</Text>
          <Text style={styles.headerSub}>Moliyaviy ko'rsatkichlar</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: '#EFF6FF' }]}>
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
            onPress={() => {}}
          />
          <NavCard
            label="Xarajatlar"
            iconName="receipt-outline"
            iconColor={C.orange}
            iconBg="#FFFBEB"
            onPress={() => {}}
          />
          <NavCard
            label="To'lovlar tarixi"
            iconName="card-outline"
            iconColor={C.green}
            iconBg="#F0FDF4"
            onPress={() => {}}
          />
          <NavCard
            label="Hisobotlar"
            iconName="document-text-outline"
            iconColor="#7C3AED"
            iconBg="#F5F3FF"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  content: { paddingBottom: 40 },

  pillsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  loader: { marginTop: 40 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, paddingHorizontal: 16, marginTop: 16, marginBottom: 8,
  },

  cardGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 8,
  },
  statCard: {
    width: '47%', flexGrow: 1,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: { fontSize: 11, fontWeight: '600', color: C.muted, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: C.text },
  statSub: { fontSize: 11, color: C.muted, marginTop: 3 },

  breakdownCard: {
    marginHorizontal: 16,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    paddingVertical: 4,
  },
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  breakdownDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary,
  },
  breakdownMethod: { fontSize: 14, fontWeight: '600', color: C.text },
  breakdownAmount: { fontSize: 14, fontWeight: '700', color: C.primary },
  breakdownDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 14 },

  navGrid: {
    paddingHorizontal: 16, gap: 8,
  },
  navCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14, gap: 12,
  },
  navIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  navLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  navChevron: { marginLeft: 'auto' },
});
