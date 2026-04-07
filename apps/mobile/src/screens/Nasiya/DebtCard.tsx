import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DebtRecord, DebtStatus } from '../../api/nasiya.api';
import { formatUZS } from '../../utils/currency';
import ReminderActionSheet from './ReminderActionSheet';

interface Props {
  debt: DebtRecord;
  onPay: (debt: DebtRecord) => void;
  onPress?: (debt: DebtRecord) => void;
}

const STATUS_COLORS: Record<DebtStatus, { bg: string; text: string }> = {
  ACTIVE:    { bg: '#EFF6FF', text: '#2563EB' },
  PARTIAL:   { bg: '#FFF7ED', text: '#EA580C' },
  PAID:      { bg: '#F0FDF4', text: '#16A34A' },
  OVERDUE:   { bg: '#FEF2F2', text: '#DC2626' },
  CANCELLED: { bg: '#F3F4F6', text: '#6B7280' },
};

const PROGRESS_COLOR: Record<DebtStatus, string> = {
  ACTIVE:    '#3B82F6',
  PARTIAL:   '#F59E0B',
  PAID:      '#16A34A',
  OVERDUE:   '#EF4444',
  CANCELLED: '#9CA3AF',
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

export default function DebtCard({ debt, onPay, onPress }: Props) {
  const { t } = useTranslation();
  const [paymentsExpanded, setPayExpanded]    = useState(false);
  const [reminderModal, setReminderModal]     = useState(false);
  const colors = STATUS_COLORS[debt.status];
  const isPaid = debt.status === 'PAID' || debt.status === 'CANCELLED';
  const days = overdueDays(debt.dueDate);
  const isOverdue = debt.status === 'OVERDUE' || (days > 0 && !isPaid);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(debt)}
      activeOpacity={0.9}
    >
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName} numberOfLines={1}>
            {debt.customer.name}
          </Text>
          {debt.customer.phone ? (
            <TouchableOpacity
              onPress={() => void Linking.openURL(`tel:${debt.customer.phone}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.phone}>📞 {debt.customer.phone}</Text>
            </TouchableOpacity>
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

      {/* Progress bar */}
      {(() => {
        const total = Number(debt.totalAmount);
        const pct = total > 0 ? Math.min(100, (Number(debt.paidAmount) / total) * 100) : 0;
        const barColor = PROGRESS_COLOR[debt.status];
        return (
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${pct}%` as `${number}%`, backgroundColor: barColor },
                ]}
              />
            </View>
            <Text style={[styles.progressPct, { color: barColor }]}>
              {Math.round(pct)}% to'langan
            </Text>
          </View>
        );
      })()}

      {/* Payment history toggle */}
      {debt.payments.length > 0 && (
        <TouchableOpacity
          style={styles.historyToggle}
          onPress={() => setPayExpanded((p) => !p)}
          activeOpacity={0.7}
        >
          <Text style={styles.historyToggleText}>
            To'lovlar tarixi ({debt.payments.length} ta)
          </Text>
          <Text style={styles.historyChevron}>{paymentsExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      )}

      {paymentsExpanded && (
        <View style={styles.historyList}>
          {debt.payments.map((p) => (
            <View key={p.id} style={styles.historyRow}>
              <Text style={styles.historyDate}>
                {new Date(p.createdAt).toLocaleDateString('uz-UZ', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                })}
              </Text>
              <Text style={styles.historyMethod}>
                {p.method === 'CASH' ? 'Naqd' : p.method === 'CARD' ? 'Karta' : p.method}
              </Text>
              <Text style={styles.historyAmount}>{formatUZS(Number(p.amount))}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Due date row */}
      <View style={styles.footer}>
        <Text style={[styles.dueDate, isOverdue && styles.dueDateOverdue]}>
          {t('nasiya.dueDate')}: {formatDueDate(debt.dueDate, t)}
          {isOverdue && days > 0 ? `  •  ${days} ${t('nasiya.overdueDay')}` : ''}
        </Text>

        {!isPaid && (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.reminderBtn}
              onPress={() => setReminderModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.reminderBtnText}>📩 {t('nasiya.reminderButton')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => onPay(debt)}
              activeOpacity={0.8}
            >
              <Text style={styles.payBtnText}>{t('nasiya.payButton')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ReminderActionSheet
        visible={reminderModal}
        onClose={() => setReminderModal(false)}
        customer={debt.customer}
        debtId={debt.id}
      />
    </TouchableOpacity>
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
    color: '#2563EB',
    marginTop: 2,
    textDecorationLine: 'underline',
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
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
  historyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 2,
  },
  historyToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  historyChevron: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  historyList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    gap: 6,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyDate: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  historyMethod: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginHorizontal: 8,
  },
  historyAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
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
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  reminderBtn: {
    borderWidth: 1,
    borderColor: '#EA580C',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderBtnText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '700',
  },
  payBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
