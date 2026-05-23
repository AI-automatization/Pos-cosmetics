import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '@/navigation/types';
import { customersApi } from '@/api/customers.api';
import ErrorView from '@/components/common/ErrorView';
import { DebtPaySheet } from './DebtPaySheet';
import { useCustomerDebts } from '../../hooks/customers/useCustomerDebts';
import type { DebtRecord } from '../../api/nasiya.api';
import { useScreenProtection } from '../../hooks/useScreenProtection';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:       '#F9FAFB',
  white:    '#FFFFFF',
  text:     '#111827',
  muted:    '#9CA3AF',
  border:   '#E5E7EB',
  primary:  '#2563EB',
  red:      '#DC2626',
  redBg:    '#FEF2F2',
  green:    '#16A34A',
  greenBg:  '#F0FDF4',
  avatarBg: '#EFF6FF',
};

// ─── Types ─────────────────────────────────────────────
type RouteProps = RouteProp<MoreStackParamList, 'CustomerDetail'>;
type Nav = NativeStackNavigationProp<MoreStackParamList, 'CustomerDetail'>;

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}

function getInitials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}

function genderLabel(gender: 'MALE' | 'FEMALE' | null): string {
  if (gender === 'MALE') return 'Erkak';
  if (gender === 'FEMALE') return 'Ayol';
  return '—';
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ru-RU');
}

// ─── Aging badge ───────────────────────────────────────
type AgeBucket = 'joriy' | '0-30' | '31-60' | '61-90' | '90+';

const AGE_STYLE: Record<AgeBucket, { label: string; color: string; bg: string }> = {
  'joriy':  { label: 'Joriy',      color: '#16A34A', bg: '#F0FDF4' },
  '0-30':   { label: '0–30 kun',   color: '#CA8A04', bg: '#FEFCE8' },
  '31-60':  { label: '31–60 kun',  color: '#D97706', bg: '#FFFBEB' },
  '61-90':  { label: '61–90 kun',  color: '#DC2626', bg: '#FEF2F2' },
  '90+':    { label: '90+ kun',    color: '#7F1D1D', bg: '#FEE2E2' },
};

function getAgeBucket(dueDate?: string | null): AgeBucket {
  if (!dueDate) return 'joriy';
  const days = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86_400_000);
  if (days <= 0)  return 'joriy';
  if (days <= 30) return '0-30';
  if (days <= 60) return '31-60';
  if (days <= 90) return '61-90';
  return '90+';
}

interface AgeBadgeProps {
  readonly dueDate?: string | null;
}

function AgeBadge({ dueDate }: AgeBadgeProps) {
  const bucket = getAgeBucket(dueDate);
  const style  = AGE_STYLE[bucket];
  return (
    <View style={[ageBadgeStyles.wrap, { backgroundColor: style.bg }]}>
      <Text style={[ageBadgeStyles.text, { color: style.color }]}>{style.label}</Text>
    </View>
  );
}

const ageBadgeStyles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ─── DebtItem ──────────────────────────────────────────
interface DebtItemProps {
  readonly debt: DebtRecord;
  readonly onPay: (debt: DebtRecord) => void;
}

function DebtItem({ debt, onPay }: DebtItemProps) {
  return (
    <View style={debtItemStyles.card}>
      <View style={debtItemStyles.topRow}>
        <AgeBadge dueDate={debt.dueDate} />
        <View style={debtItemStyles.remainingWrap}>
          <Text style={debtItemStyles.remainingLabel}>Qolgan: </Text>
          <Text style={debtItemStyles.remainingValue}>{fmt(Number(debt.remaining))}</Text>
        </View>
        <TouchableOpacity
          style={debtItemStyles.payBtn}
          onPress={() => onPay(debt)}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={debtItemStyles.payBtnText}>To'lash</Text>
          <Ionicons name="chevron-forward" size={12} color="#2563EB" />
        </TouchableOpacity>
      </View>
      <View style={debtItemStyles.bottomRow}>
        <Text style={debtItemStyles.meta}>Jami: {fmt(Number(debt.totalAmount))}</Text>
        <Text style={debtItemStyles.metaDot}> · </Text>
        <Text style={debtItemStyles.meta}>Muddat: {fmtDate(debt.dueDate)}</Text>
      </View>
    </View>
  );
}

const debtItemStyles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  remainingWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingLabel: {
    fontSize: 13,
    color: C.muted,
    fontWeight: '500',
  },
  remainingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: C.red,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    minWidth: 48,
    minHeight: 48 / 2,
  },
  payBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    fontSize: 12,
    color: C.muted,
  },
  metaDot: {
    fontSize: 12,
    color: C.muted,
  },
});

// ─── InfoRow ───────────────────────────────────────────
interface InfoRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  valueColor?: string;
}

function InfoRow({ icon, label, value, valueColor }: InfoRowProps) {
  return (
    <View style={infoStyles.row}>
      <View style={infoStyles.iconWrap}>
        <Ionicons name={icon} size={16} color={C.primary} />
      </View>
      <View style={infoStyles.body}>
        <Text style={infoStyles.label}>{label}</Text>
        <Text style={[infoStyles.value, valueColor ? { color: valueColor } : undefined]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  label: { fontSize: 11, fontWeight: '600', color: C.muted, letterSpacing: 0.3 },
  value: { fontSize: 15, fontWeight: '500', color: C.text, marginTop: 1 },
});

// ─── StatCard ──────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  accent?: string;
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <View style={statStyles.card}>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, accent ? { color: accent } : undefined]}>{value}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  value: {
    fontSize: 17,
    fontWeight: '800',
    color: C.text,
    textAlign: 'center',
  },
});

// ─── CustomerDetailScreen ─────────────────────────────
export default function CustomerDetailScreen() {
  useScreenProtection();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { customerId, customerName } = route.params;

  const [payingDebt, setPayingDebt] = useState<DebtRecord | null>(null);

  const {
    data: customer,
    isLoading: loadingCustomer,
    error: errorCustomer,
    refetch: refetchCustomer,
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customersApi.getById(customerId),
    staleTime: 60_000,
  });

  const {
    data: stats,
    isLoading: loadingStats,
    error: errorStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['customer-stats', customerId],
    queryFn: () => customersApi.getStats(customerId),
    staleTime: 60_000,
  });

  const { data: debts = [] } = useCustomerDebts(customerId);
  const activeDebts = debts.filter((d) => Number(d.remaining) > 0);

  const isLoading = loadingCustomer || loadingStats;
  const anyError  = errorCustomer ?? errorStats;

  if (anyError) {
    return (
      <ErrorView
        error={anyError}
        onRetry={() => { void refetchCustomer(); void refetchStats(); }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{customerName}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Avatar & name hero */}
          <View style={styles.hero}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>
                {getInitials(customer?.name ?? customerName)}
              </Text>
            </View>
            <Text style={styles.heroName}>{customer?.name ?? customerName}</Text>
            {customer && (
              <View style={[
                styles.statusBadge,
                customer.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  customer.isActive ? styles.statusBadgeTextActive : styles.statusBadgeTextInactive,
                ]}>
                  {customer.isActive ? 'Faol' : 'Nofaol'}
                </Text>
              </View>
            )}
          </View>

          {/* Stats */}
          {stats && (
            <>
              <Text style={styles.sectionLabel}>STATISTIKA</Text>
              <View style={styles.statsRow}>
                <StatCard
                  label="Buyurtmalar"
                  value={stats.orderCount.toLocaleString('ru-RU') + ' ta'}
                />
                <StatCard
                  label="Jami xarid"
                  value={stats.totalSpent >= 1_000_000
                    ? (stats.totalSpent / 1_000_000).toFixed(1) + ' mln'
                    : stats.totalSpent.toLocaleString('ru-RU')}
                />
                <StatCard
                  label="Nasiya"
                  value={stats.debtBalance > 0
                    ? (stats.debtBalance / 1_000).toFixed(0) + ' ming'
                    : '0'}
                  accent={stats.debtBalance > 0 ? C.red : C.green}
                />
              </View>
            </>
          )}

          {/* Contact info */}
          {customer && (
            <>
              <Text style={styles.sectionLabel}>KONTAKT MA'LUMOTLAR</Text>
              <View style={styles.card}>
                <InfoRow
                  icon="call-outline"
                  label="Telefon"
                  value={customer.phone ?? '—'}
                />
                <View style={styles.divider} />
                <InfoRow
                  icon="mail-outline"
                  label="Email"
                  value={customer.email ?? '—'}
                />
                <View style={styles.divider} />
                <InfoRow
                  icon="location-outline"
                  label="Manzil"
                  value={customer.address ?? '—'}
                />
                <View style={styles.divider} />
                <InfoRow
                  icon="person-outline"
                  label="Jinsi"
                  value={genderLabel(customer.gender)}
                />
              </View>

              {/* Financial info */}
              <Text style={styles.sectionLabel}>MOLIYAVIY MA'LUMOTLAR</Text>
              <View style={styles.card}>
                <InfoRow
                  icon="wallet-outline"
                  label="Nasiya balansi"
                  value={fmt(customer.debtBalance)}
                  valueColor={customer.debtBalance > 0 ? C.red : C.green}
                />
                <View style={styles.divider} />
                <View style={infoStyles.row}>
                  <View style={infoStyles.iconWrap}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={C.primary} />
                  </View>
                  <View style={infoStyles.body}>
                    <Text style={infoStyles.label}>Nasiya limiti</Text>
                    <Text style={infoStyles.value}>{fmt(customer.debtLimit)}</Text>
                    {customer.debtLimit > 0 && (
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${Math.min(100, (customer.debtBalance / customer.debtLimit) * 100)}%`,
                              backgroundColor: customer.debtBalance > customer.debtLimit ? '#ef4444' : '#3b82f6',
                            },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Active debts */}
              <Text style={styles.sectionLabel}>FAOL QARZLAR</Text>
              {activeDebts.length === 0 ? (
                <View style={styles.emptyDebtsWrap}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={C.green} />
                  <Text style={styles.emptyDebtsText}>Qarz yo'q</Text>
                </View>
              ) : (
                <View style={styles.debtsWrap}>
                  <FlatList
                    data={activeDebts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <DebtItem debt={item} onPay={setPayingDebt} />
                    )}
                    scrollEnabled={false}
                  />
                </View>
              )}

              {/* Notes */}
              {customer.notes ? (
                <>
                  <Text style={styles.sectionLabel}>IZOHLAR</Text>
                  <View style={styles.card}>
                    <View style={styles.notesWrap}>
                      <Text style={styles.notesText}>{customer.notes}</Text>
                    </View>
                  </View>
                </>
              ) : null}
            </>
          )}
        </ScrollView>
      )}

      {payingDebt && (
        <DebtPaySheet
          debt={{
            id: payingDebt.id,
            totalAmount: Number(payingDebt.totalAmount),
            remaining: Number(payingDebt.remaining),
            orderNumber: payingDebt.orderId,
          }}
          onClose={() => setPayingDebt(null)}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },
  headerPlaceholder: { width: 36 },

  loader: { marginTop: 40 },
  content: { paddingBottom: 48 },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 8,
  },
  heroAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroAvatarText: { fontSize: 26, fontWeight: '800', color: C.primary },
  heroName: { fontSize: 20, fontWeight: '800', color: C.text },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeActive: { backgroundColor: C.greenBg },
  statusBadgeInactive: { backgroundColor: C.redBg },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  statusBadgeTextActive: { color: C.green },
  statusBadgeTextInactive: { color: C.red },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 4,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },

  // Info card
  card: {
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 48,
  },

  // Notes
  notesWrap: { paddingVertical: 14 },
  notesText: { fontSize: 14, color: C.text, lineHeight: 22 },

  // Active debts section
  debtsWrap: {
    marginHorizontal: 16,
  },
  emptyDebtsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    backgroundColor: C.greenBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emptyDebtsText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.green,
  },

  // Progress bar
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
