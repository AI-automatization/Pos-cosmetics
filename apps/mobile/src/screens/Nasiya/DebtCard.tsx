import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DebtRecord, DebtStatus } from '../../api/nasiya.api';
import { formatUZS } from '../../utils/currency';

interface Props {
  debt: DebtRecord;
  onPay: (debt: DebtRecord) => void;
}

const STATUS_COLORS: Record<DebtStatus, { bg: string; text: string }> = {
  ACTIVE:    { bg: '#EFF6FF', text: '#2563EB' },
  PARTIAL:   { bg: '#FFF7ED', text: '#EA580C' },
  PAID:      { bg: '#F0FDF4', text: '#16A34A' },
  OVERDUE:   { bg: '#FEF2F2', text: '#DC2626' },
  CANCELLED: { bg: '#F3F4F6', text: '#6B7280' },
};

function statusLabel(status: DebtStatus, t: ReturnType<typeof useTranslation>['t']): string {
  const map: Record<DebtStatus, string> = {
    ACTIVE:    t('nasiya.statusActive'),
    PARTIAL:   t('nasiya.statusPartial'),
    PAID:      t('nasiya.statusPaid'),
    OVERDUE:   t('nasiya.statusOverdue'),
    CANCELLED: t('nasiya.statusCancelled'),
  };
  return map[status];
}

function overdueDays(dueDate: string | null): number {
  if (!dueDate) return 0;
  const diff = Date.now() - new Date(dueDate).getTime();
  return diff > 0 ? Math.floor(diff / 86_400_000) : 0;
}

function formatDueDate(dueDate: string | null, t: ReturnType<typeof useTranslation>['t']): string {
  if (!dueDate) return t('nasiya.noDueDate');
  return new Date(dueDate).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export default function DebtCard({ debt, onPay }: Props) {
  const { t } = useTranslation();
  const colors = STATUS_COLORS[debt.status];
  const isPaid = debt.status === 'PAID' || debt.status === 'CANCELLED';
  const days = overdueDays(debt.dueDate);
  const isOverdue = debt.status === 'OVERDUE' || (days > 0 && !isPaid);

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName} numberOfLines={1}>
            {debt.customer.name}
          </Text>
          {debt.customer.phone ? (
            <Text style={styles.phone}>{debt.customer.phone}</Text>
          ) : null}
        </View>
        <View style={[styles.badge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {statusLabel(debt.status, t)}
          </Text>
        </View>
      </View>

      {/* Amounts */}
      <View style={styles.amounts}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>{t('nasiya.total')}</Text>
          <Text style={styles.amountValue}>{formatUZS(Number(debt.totalAmount))}</Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>{t('nasiya.paid')}</Text>
          <Text style={[styles.amountValue, { color: '#16A34A' }]}>
            {formatUZS(Number(debt.paidAmount))}
          </Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>{t('nasiya.remaining')}</Text>
          <Text style={[styles.amountValue, { color: '#DC2626', fontWeight: '700' }]}>
            {formatUZS(Number(debt.remaining))}
          </Text>
        </View>
      </View>

      {/* Due date row */}
      <View style={styles.footer}>
        <Text style={[styles.dueDate, isOverdue && styles.dueDateOverdue]}>
          {t('nasiya.dueDate')}: {formatDueDate(debt.dueDate, t)}
          {isOverdue && days > 0 ? `  •  ${days} ${t('nasiya.overdueDay')}` : ''}
        </Text>

        {!isPaid && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => onPay(debt)}
            activeOpacity={0.8}
          >
            <Text style={styles.payBtnText}>{t('nasiya.payButton')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
    marginRight: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  phone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  amountItem: {
    alignItems: 'center',
    flex: 1,
  },
  amountLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  dueDateOverdue: {
    color: '#DC2626',
    fontWeight: '600',
  },
  payBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
