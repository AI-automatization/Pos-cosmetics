import React, { useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, Switch, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  useLoyaltyAccount, useLoyaltyConfig, pointsToMoney, moneyToPoints,
} from '../../hooks/useLoyalty';
import { fmt } from './PaymentSheetTypes';

// ─── Props ─────────────────────────────────────────────
interface Props {
  readonly customerId: string;
  readonly orderTotal: number;
  readonly redeemPoints: number;
  readonly onRedeemPointsChange: (points: number) => void;
  /** Lifted from the parent (single source of truth). Falls back to config when undefined. */
  readonly redeemRate?: number;
  /** Lifted from the parent (single source of truth). Falls back to local calc when undefined. */
  readonly discountAmount?: number;
}

const QUICK_PERCENTS = [25, 50, 75, 100] as const;
const DEFAULT_EARN_RATE = 1000;
const DEFAULT_REDEEM_RATE = 100;
const DEFAULT_MIN_REDEEM = 50;

// ─── Component ─────────────────────────────────────────
export default function LoyaltySection({
  customerId, orderTotal, redeemPoints, onRedeemPointsChange,
  redeemRate: redeemRateProp, discountAmount: discountAmountProp,
}: Props) {
  const { t } = useTranslation();
  const { data: account, isLoading: loadAcc } = useLoyaltyAccount(customerId);
  const { data: config, isLoading: loadCfg } = useLoyaltyConfig();

  const balance = account?.points ?? 0;
  const earnRate = config?.earnRate ?? DEFAULT_EARN_RATE;
  // Prefer the lifted rate so display === charged; fall back to config while it loads.
  const redeemRate = redeemRateProp ?? config?.redeemRate ?? DEFAULT_REDEEM_RATE;
  const minRedeem = config?.minRedeem ?? DEFAULT_MIN_REDEEM;
  const isActive = config?.isActive ?? false;
  const canRedeem = isActive && balance >= minRedeem;
  const isRedeeming = redeemPoints > 0;

  const maxRedeemable = useMemo(() => {
    if (!canRedeem) return 0;
    return Math.min(balance, Math.floor(orderTotal / redeemRate));
  }, [canRedeem, balance, orderTotal, redeemRate]);

  // Single source of truth: use the lifted discount when provided so the
  // "-{discountAmount}" label is byte-identical to what is charged.
  const discountAmount = discountAmountProp ?? redeemPoints * redeemRate;
  const earnablePoints = moneyToPoints(orderTotal - discountAmount, earnRate);

  const handleToggle = useCallback((on: boolean) => {
    onRedeemPointsChange(on && canRedeem ? maxRedeemable : 0);
  }, [canRedeem, maxRedeemable, onRedeemPointsChange]);

  const handleInput = useCallback((text: string) => {
    const n = parseInt(text.replace(/\s/g, ''), 10);
    onRedeemPointsChange(isNaN(n) || n <= 0 ? 0 : Math.min(n, maxRedeemable));
  }, [maxRedeemable, onRedeemPointsChange]);

  const handleQuick = useCallback((pct: number) => {
    onRedeemPointsChange(Math.floor((maxRedeemable * pct) / 100));
  }, [maxRedeemable, onRedeemPointsChange]);

  if (loadAcc || loadCfg) {
    return (
      <View style={s.card}>
        <ActivityIndicator size="small" color="#D97706" />
      </View>
    );
  }
  if (!isActive || !account) return null;

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.row}>
        <Ionicons name="star" size={18} color="#D97706" />
        <Text style={s.title}>{t('loyalty.title')}</Text>
      </View>

      {/* Balance */}
      <View style={s.row}>
        <Text style={s.label}>{t('loyalty.balance')}:</Text>
        <Text style={s.value}>
          {balance.toLocaleString('ru-RU')} ({fmt(pointsToMoney(balance, redeemRate))})
        </Text>
      </View>

      {/* Toggle */}
      <View style={s.toggleRow}>
        <Text style={s.toggleLabel}>{t('loyalty.usePoints')}</Text>
        <Switch
          value={isRedeeming}
          onValueChange={handleToggle}
          disabled={!canRedeem}
          trackColor={{ false: '#E5E7EB', true: '#D97706' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {!canRedeem && balance > 0 && (
        <Text style={s.hint}>{t('loyalty.minRequired', { min: minRedeem })}</Text>
      )}

      {/* Redeem controls */}
      {isRedeeming && (
        <>
          <View style={s.inputWrap}>
            <TextInput
              style={s.input}
              value={redeemPoints > 0 ? String(redeemPoints) : ''}
              onChangeText={handleInput}
              keyboardType="numeric"
              textAlign="right"
              placeholder="0"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={s.suffix}>{t('loyalty.points')}</Text>
          </View>

          <View style={s.quickRow}>
            {QUICK_PERCENTS.map((pct) => {
              const active = redeemPoints === Math.floor((maxRedeemable * pct) / 100);
              return (
                <TouchableOpacity
                  key={pct}
                  style={[s.quickBtn, active && s.quickActive]}
                  onPress={() => handleQuick(pct)}
                >
                  <Text style={[s.quickText, active && s.quickTextActive]}>
                    {pct}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.discountRow}>
            <Ionicons name="pricetag-outline" size={16} color="#16A34A" />
            <Text style={s.discountText}>{t('loyalty.discount')}: -{fmt(discountAmount)}</Text>
          </View>
        </>
      )}

      {/* Earn info */}
      <View style={s.earnRow}>
        <Ionicons name="add-circle-outline" size={16} color="#D97706" />
        <Text style={s.earnText}>{t('loyalty.willEarn')}: +{earnablePoints} {t('loyalty.points')}</Text>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────
const AMBER_BG = '#FEF9C3';
const AMBER_BORDER = '#FDE68A';
const AMBER_DARK = '#92400E';
const AMBER_MID = '#78350F';
const AMBER_ICON = '#D97706';

const s = StyleSheet.create({
  card: {
    backgroundColor: AMBER_BG, borderRadius: 14, padding: 16,
    marginTop: 12, marginBottom: 8, borderWidth: 1, borderColor: AMBER_BORDER,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', color: AMBER_DARK, marginLeft: 4 },
  label: { fontSize: 14, fontWeight: '500', color: AMBER_MID },
  value: { fontSize: 14, fontWeight: '700', color: AMBER_DARK },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: AMBER_BORDER,
  },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: AMBER_MID },
  hint: { fontSize: 12, color: '#B45309', fontWeight: '500', marginTop: 4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB',
    borderRadius: 12, paddingHorizontal: 16, height: 48,
    borderWidth: 1, borderColor: AMBER_BORDER, marginTop: 12,
  },
  input: { flex: 1, fontSize: 20, fontWeight: '700', color: '#111827' },
  suffix: { fontSize: 14, fontWeight: '600', color: '#B45309', marginLeft: 8 },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  quickBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', height: 36,
    borderRadius: 8, borderWidth: 1.5, borderColor: AMBER_ICON, backgroundColor: 'transparent',
  },
  quickActive: { backgroundColor: AMBER_ICON },
  quickText: { fontSize: 13, fontWeight: '700', color: AMBER_ICON },
  quickTextActive: { color: '#FFFFFF' },
  discountRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: AMBER_BORDER,
  },
  discountText: { fontSize: 14, fontWeight: '700', color: '#16A34A' },
  earnRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  earnText: { fontSize: 13, fontWeight: '600', color: '#B45309' },
});
