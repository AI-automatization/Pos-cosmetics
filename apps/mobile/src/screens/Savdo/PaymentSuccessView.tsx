import React, { useCallback, useState } from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import SuccessAnimation from './SuccessAnimation';
import LoyaltyInfoCard from './LoyaltyInfoCard';
import ReceiptActionButtons from './ReceiptActionButtons';
import { type PaymentMethod, fmt, METHODS } from './PaymentSheetTypes';
import { useSunmiPrinter } from '../../hooks/useSunmiPrinter';
import { type ReceiptData } from '../../services/PrinterService';
import { receiptPdfService } from '../../services/ReceiptPdfService';
import { smsReceiptService } from '../../services/SmsReceiptService';
import { useAuthStore } from '../../store/auth.store';
import styles from './PaymentSuccessView.styles';

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
  readonly customerPhone?: string | null;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const FALLBACK_METHOD = {
  key: 'NAQD' as PaymentMethod,
  label: 'Naqd',
  icon: 'cash',
  color: '#6B7280',
} as const;

const AUTO_DISMISS_SECONDS = 3;

// ─── Component ──────────────────────────────────────────────────────────────

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
  customerPhone,
}: PaymentSuccessViewProps) {
  const { t } = useTranslation();
  const [seconds, setSeconds] = React.useState(AUTO_DISMISS_SECONDS);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);
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

  const buildReceiptData = useCallback((): ReceiptData | null => {
    if (!cart || !orderNumber) return null;
    return {
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
        ? { earned: pointsEarned, redeemed: pointsRedeemed, balance: newBalance }
        : undefined,
      date: new Date(),
    };
  }, [cart, orderNumber, total, user, cfg, receivedAmount, pointsEarned, pointsRedeemed, newBalance]);

  const handlePrint = useCallback(async () => {
    const data = buildReceiptData();
    if (!data) return;
    await printReceipt(data);
  }, [buildReceiptData, printReceipt]);

  const handleSharePdf = useCallback(async () => {
    const data = buildReceiptData();
    if (!data) return;
    setIsGeneratingPdf(true);
    try {
      await receiptPdfService.shareReceipt(data);
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [buildReceiptData]);

  const handleSendSms = useCallback(async () => {
    const data = buildReceiptData();
    if (!data) return;
    setIsSendingSms(true);
    try {
      if (customerPhone) {
        await smsReceiptService.sendReceipt(data, customerPhone);
      } else {
        await smsReceiptService.sendReceiptNoNumber(data);
      }
    } finally {
      setIsSendingSms(false);
    }
  }, [buildReceiptData, customerPhone]);

  return (
    <View style={styles.container}>
      <SuccessAnimation size={100} />

      <Text style={styles.title}>{t('receipt.paymentConfirmed')}</Text>

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

      <LoyaltyInfoCard
        pointsEarned={pointsEarned}
        pointsRedeemed={pointsRedeemed}
        newBalance={newBalance}
      />

      {cart && orderNumber ? (
        <ReceiptActionButtons
          isPrinterAvailable={isAvailable}
          isPrinting={isPrinting}
          isPdfAvailable={receiptPdfService.isAvailable()}
          isGeneratingPdf={isGeneratingPdf}
          isSendingSms={isSendingSms}
          onPrint={handlePrint}
          onSharePdf={handleSharePdf}
          onSendSms={handleSendSms}
        />
      ) : null}
      {printError ? (
        <Text style={styles.printError}>{printError}</Text>
      ) : null}

      <Text style={styles.countdown}>{t('receipt.closesIn', { seconds })}</Text>
    </View>
  );
}
