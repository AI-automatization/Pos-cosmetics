import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { billingApi } from '../../api/billing.api';
import type { SubscriptionStatus } from '../../api/billing.api';

// ─── Colors ────────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  purple:  '#7C3AED',
} as const;

// ─── Status config ─────────────────────────────────────────
const STATUS_I18N_KEYS: Record<SubscriptionStatus, string> = {
  TRIAL:     'billing.statusTrial',
  ACTIVE:    'billing.statusActive',
  PAST_DUE:  'billing.statusPastDue',
  CANCELLED: 'billing.statusCancelled',
  EXPIRED:   'billing.statusExpired',
};
const STATUS_COLOR: Record<SubscriptionStatus, string> = {
  TRIAL:     '#2563EB',
  ACTIVE:    '#16A34A',
  PAST_DUE:  '#D97706',
  CANCELLED: '#6B7280',
  EXPIRED:   '#DC2626',
};

// ─── Helpers ───────────────────────────────────────────────
function fmtDate(iso: string | null): string {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtPrice(amount: number, unit: string): string {
  return amount.toLocaleString('ru-RU') + ' ' + unit;
}

// ─── BillingScreen ─────────────────────────────────────────
export default function BillingScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const { data: sub, isLoading: subLoading } =
    useQuery({ queryKey: ['billing', 'subscription'], queryFn: billingApi.getSubscription });

  const { data: usage, isLoading: usageLoading } =
    useQuery({ queryKey: ['billing', 'usage'], queryFn: billingApi.getUsage });

  const { data: plans } =
    useQuery({ queryKey: ['billing', 'plans'], queryFn: billingApi.getPlans });

  const isLoading = subLoading || usageLoading;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{t('billing.title')}</Text>
          <Text style={styles.headerSub}>{t('billing.subtitle')}</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="card-outline" size={20} color={C.purple} />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Subscription card */}
          {sub && (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.label}>{t('billing.currentPlan')}</Text>
                <View style={[styles.badge, { backgroundColor: STATUS_COLOR[sub.status] + '20' }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLOR[sub.status] }]}>
                    {t(STATUS_I18N_KEYS[sub.status])}
                  </Text>
                </View>
              </View>
              <Text style={styles.planName}>{sub.plan.name}</Text>
              <Text style={styles.planPrice}>{fmtPrice(sub.plan.priceMonthly, t('billing.pricePerMonth'))}</Text>
              <View style={styles.divider} />
              <View style={styles.cardRow}>
                <Text style={styles.meta}>{t('billing.startedAt')}: {fmtDate(sub.startedAt)}</Text>
                <Text style={styles.meta}>
                  {sub.status === 'TRIAL' ? t('billing.trialEndsAt') : t('billing.expiresAt')}: {fmtDate(sub.expiresAt ?? sub.trialEndsAt)}
                </Text>
              </View>
            </View>
          )}

          {/* Usage */}
          {usage && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t('billing.usageTitle')}</Text>
              {([
                { icon: 'business-outline', label: t('billing.branches'), ...usage.branches },
                { icon: 'cube-outline',     label: t('billing.products'), ...usage.products },
                { icon: 'person-outline',   label: t('billing.users'), ...usage.users },
              ] as const).map((row) => {
                const pct = row.max > 0 ? Math.min(row.used / row.max, 1) : 0;
                const color = pct >= 0.9 ? '#DC2626' : pct >= 0.7 ? '#D97706' : C.primary;
                return (
                  <View key={row.label} style={styles.usageRow}>
                    <View style={styles.usageHeader}>
                      <Ionicons name={row.icon as React.ComponentProps<typeof Ionicons>['name']} size={16} color={C.muted} />
                      <Text style={styles.usageLabel}>{row.label}</Text>
                      <Text style={styles.usageCount}>{row.used} / {row.max}</Text>
                    </View>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${pct * 100}%` as `${number}%`, backgroundColor: color }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Plans */}
          {plans && plans.filter(p => p.isActive).length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t('billing.availablePlans')}</Text>
              {plans.filter(p => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map((plan, i) => (
                <View key={plan.id}>
                  {i > 0 && <View style={styles.divider} />}
                  <View style={styles.planRow}>
                    <View style={styles.planInfo}>
                      <Text style={styles.planRowName}>{plan.name}</Text>
                      <Text style={styles.planRowMeta}>
                        {plan.maxBranches} {t('billing.planBranches')} {'\u00B7'} {plan.maxProducts} {t('billing.planProducts')} {'\u00B7'} {plan.maxUsers} {t('billing.planUsers')}
                      </Text>
                    </View>
                    <Text style={styles.planRowPrice}>{(plan.priceMonthly / 1000).toFixed(0)}K</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.bg },
  center:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content:  { padding: 16, gap: 12, paddingBottom: 40 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:    { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', marginLeft: -8 },
  headerText: { flex: 1, marginLeft: 4 },
  headerTitle:{ fontSize: 20, fontWeight: '800', color: C.text },
  headerSub:  { fontSize: 12, color: C.muted, marginTop: 2 },
  headerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },

  card: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, padding: 16, gap: 10,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label:    { fontSize: 13, color: C.muted, fontWeight: '600' },
  badge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:{ fontSize: 12, fontWeight: '700' },
  planName: { fontSize: 22, fontWeight: '800', color: C.text },
  planPrice:{ fontSize: 14, color: C.muted },
  meta:     { fontSize: 12, color: C.muted },
  divider:  { height: 1, backgroundColor: C.border },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1 },

  usageRow:    { gap: 6 },
  usageHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  usageLabel:  { flex: 1, fontSize: 14, color: C.text },
  usageCount:  { fontSize: 13, color: C.muted, fontWeight: '600' },
  track:       { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  fill:        { height: 6, borderRadius: 3 },

  planRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  planInfo:    { flex: 1, gap: 3 },
  planRowName: { fontSize: 15, fontWeight: '700', color: C.text },
  planRowMeta: { fontSize: 12, color: C.muted },
  planRowPrice:{ fontSize: 16, fontWeight: '800', color: C.primary },
});
