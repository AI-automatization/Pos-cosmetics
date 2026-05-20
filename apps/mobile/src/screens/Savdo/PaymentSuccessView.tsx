import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SuccessAnimation from './SuccessAnimation';
import { type PaymentMethod, fmt, METHODS } from './PaymentSheetTypes';

// ─── Props ──────────────────────────────────────────────────────────────────

interface PaymentSuccessViewProps {
  readonly method: PaymentMethod;
  readonly total: number;
  readonly onDismiss: () => void;
  readonly pointsEarned?: number;
  readonly pointsRedeemed?: number;
  readonly newBalance?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FALLBACK_METHOD = { key: 'NAQD' as PaymentMethod, label: 'Naqd', icon: 'cash', color: '#6B7280' } as const;
const AUTO_DISMISS_SECONDS = 3;

// ─── Component ───────────────────────────────────────────────────────────────

export default function PaymentSuccessView({
  method,
  total,
  onDismiss,
  pointsEarned,
  pointsRedeemed,
  newBalance,
}: PaymentSuccessViewProps) {
  const [seconds, setSeconds] = React.useState(AUTO_DISMISS_SECONDS);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onDismiss]);

  const cfg = METHODS.find(m => m.key === method) ?? FALLBACK_METHOD;

  return (
    <View style={styles.container}>
      <SuccessAnimation size={100} />

      <Text style={styles.title}>To'lov tasdiqlandi!</Text>

      <Text style={styles.total}>{fmt(total)}</Text>

      <View style={styles.badgeWrapper}>
        <View style={[styles.badge, { backgroundColor: cfg.color }]}>
          <MaterialCommunityIcons
            name={cfg.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
            size={14}
            color="#FFFFFF"
          />
          <Text style={styles.badgeLabel}>{cfg.label}</Text>
        </View>
      </View>

      {(pointsEarned || pointsRedeemed) ? (
        <View style={styles.loyaltyInfo}>
          {pointsRedeemed ? (
            <Text style={styles.loyaltyText}>Ishlatildi: -{pointsRedeemed} ball</Text>
          ) : null}
          {pointsEarned ? (
            <Text style={styles.loyaltyEarn}>Yig'ildi: +{pointsEarned} ball</Text>
          ) : null}
          {newBalance !== undefined ? (
            <Text style={styles.loyaltyBalance}>Jami: {newBalance} ball</Text>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.countdown}>{seconds} soniyada yopiladi</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 16,
    textAlign: 'center',
  },
  total: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  badgeWrapper: {
    alignItems: 'center',
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loyaltyInfo: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FEF9C3',
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  loyaltyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },
  loyaltyEarn: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  loyaltyBalance: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  countdown: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 20,
  },
});
