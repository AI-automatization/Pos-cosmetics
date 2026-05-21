import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import SuccessAnimation from './SuccessAnimation';
import { type PaymentMethod, fmt, METHODS } from './PaymentSheetTypes';
import { useSunmiPrinter } from '../../hooks/useSunmiPrinter';
import { type ReceiptData } from '../../services/PrinterService';
import { useAuthStore } from '../../store/auth.store';

// ─── Props ──────────────────────────────────────────────────────────────────

interface PaymentSuccessViewProps {
  readonly method: PaymentMethod;
  readonly total: number;
  readonly onDismiss: () => void;
  readonly pointsEarned?: number;
  readonly pointsRedeemed?: number;
  readonly newBalance?: number;
  readonly orderNumber?: number | string;
  readonly cart?: ReadonlyArray<{ product: { name: string; sellPrice: number }; qty: number }>;
  readonly receivedAmount?: number;
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
  orderNumber,
  cart,
  receivedAmount,
}: PaymentSuccessViewProps) {
  const [seconds, setSeconds] = React.useState(AUTO_DISMISS_SECONDS);
  const { isAvailable, isPrinting, error: printError, printReceipt } = useSunmiPrinter();
  const { user } = useAuthStore();

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

  const handlePrint = useCallback(async () => {
    if (!cart || !orderNumber) return;
    const receiptData: ReceiptData = {
      companyName: user?.tenant?.name ?? 'RAOS',
      branchName: user?.tenant?.name,
      orderNumber,
      cashierName: user ? `${user.firstName} ${user.lastName}` : undefined,
      items: cart.map(i => ({
        name: i.product.name,
        qty: i.qty,
        unitPrice: i.product.sellPrice,
        total: i.product.sellPrice * i.qty,
      })),
      subtotal: total,
      total,
      paymentMethod: cfg.label,
      receivedAmount,
      change: receivedAmount ? receivedAmount - total : undefined,
      loyaltyPoints: pointsEarned || pointsRedeemed
        ? {
            earned: pointsEarned,
            redeemed: pointsRedeemed,
            balance: newBalance,
          }
        : undefined,
      date: new Date(),
    };
    await printReceipt(receiptData);
  }, [cart, orderNumber, total, user, cfg, receivedAmount, pointsEarned, pointsRedeemed, newBalance, printReceipt]);

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

      {isAvailable && cart && orderNumber ? (
        <TouchableOpacity
          style={[styles.printBtn, isPrinting && styles.printBtnDisabled]}
          onPress={handlePrint}
          disabled={isPrinting}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isPrinting ? 'hourglass-outline' : 'print-outline'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.printBtnText}>
            {isPrinting ? 'Chop etilmoqda...' : 'Chek chop etish'}
          </Text>
        </TouchableOpacity>
      ) : null}
      {printError ? (
        <Text style={styles.printError}>{printError}</Text>
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
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    borderRadius: 12,
    height: 44,
    marginTop: 16,
    paddingHorizontal: 24,
  },
  printBtnDisabled: {
    opacity: 0.6,
  },
  printBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  printError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 6,
    textAlign: 'center',
  },
  countdown: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 20,
  },
});
