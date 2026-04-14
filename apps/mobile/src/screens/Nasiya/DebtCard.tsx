import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  PARTIAL:   { bg: '#FFFBEB', text: '#D97706' },
  PAID:      { bg: '#F0FDF4', text: '#16A34A' },
  OVERDUE:   { bg: '#FEF2F2', text: '#DC2626' },
  CANCELLED: { bg: '#F3F4F6', text: '#6B7280' },
};

const PROGRESS_COLOR: Record<DebtStatus, string> = {
  ACTIVE:    '#2563EB',
  PARTIAL:   '#D97706',
  PAID:      '#16A34A',
  OVERDUE:   '#DC2626',
  CANCELLED: '#9CA3AF',
};

const STATUS_LABEL: Record<DebtStatus, string> = {
  ACTIVE:    'Faol',
  PARTIAL:   'Qisman',
  PAID:      "To'langan",
  OVERDUE:   "Muddati o'tgan",
  CANCELLED: 'Bekor qilindi',
};

function statusLabel(status: DebtStatus): string {
  return STATUS_LABEL[status];
}

function overdueDays(dueDate: string | null): number {
  if (!dueDate) return 0;
  const diff = Date.now() - new Date(dueDate).getTime();
  return diff > 0 ? Math.floor(diff / 86_400_000) : 0;
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return 'Muddat belgilanmagan';
  return new Date(dueDate).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

interface AgeBucket {
  label: string;
  bg: string;
  text: string;
}

function ageBucket(dueDate: string | null): AgeBucket {
  if (!dueDate) return { label: 'Joriy', bg: '#F0FDF4', text: '#16A34A' };
  const days = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86_400_000);
  if (days <= 0) return { label: 'Joriy', bg: '#F0FDF4', text: '#16A34A' };
  if (days <= 30) return { label: `${days} kun`, bg: '#FFFBEB', text: '#D97706' };
  if (days <= 60) return { label: `${days} kun`, bg: '#FEF3C7', text: '#B45309' };
  if (days <= 90) return { label: `${days} kun`, bg: '#FFEDD5', text: '#EA580C' };
  return { label: `${days} kun`, bg: '#FEF2F2', text: '#DC2626' };
}

export default function DebtCard({ debt, onPay, onPress }: Props) {
  const [paymentsExpanded, setPayExpanded] = useState(false);
  const [reminderModal, setReminderModal]  = useState(false);

  const colors   = STATUS_COLORS[debt.status];
  const isPaid   = debt.status === 'PAID' || debt.status === 'CANCELLED';
  const days     = overdueDays(debt.dueDate);
  const isOverdue = debt.status === 'OVERDUE' || (days > 0 && !isPaid);

  const total = Number(debt.totalAmount);
  const pct   = total > 0 ? Math.min(100, (Number(debt.paidAmount) / total) * 100) : 0;
  const barColor = PROGRESS_COLOR[debt.status];
  const bucket   = ageBucket(debt.dueDate);

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
              <View style={styles.phoneRow}>
                <Ionicons name="call-outline" size={12} color="#2563EB" />
                <Text style={styles.phone}>{debt.customer.phone}</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
        <View style={[styles.badge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {statusLabel(debt.status)}
          </Text>
        </View>
      </View>

      {/* Amounts — 3-ustunli grid */}
      <View style={styles.amounts}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Jami</Text>
          <Text style={styles.amountValue}>{formatUZS(Number(debt.totalAmount))}</Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>To'langan</Text>
          <Text style={[styles.amountValue, { color: '#16A34A' }]}>
            {formatUZS(Number(debt.paidAmount))}
          </Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Qoldiq</Text>
          <Text style={[styles.amountValue, { color: '#DC2626', fontWeight: '700' }]}>
            {formatUZS(Number(debt.remaining))}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
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

      {/* Footer — due date + age badge + buttons */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={[styles.dueDate, isOverdue && styles.dueDateOverdue]}>
            To'lov muddati: {formatDueDate(debt.dueDate)}
          </Text>
          {debt.status !== 'PAID' && debt.status !== 'CANCELLED' && (
            <View style={[styles.ageBadge, { backgroundColor: bucket.bg }]}>
              <Text style={[styles.ageBadgeText, { color: bucket.text }]}>
                {bucket.label}
              </Text>
            </View>
          )}
        </View>

        {!isPaid && (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.reminderBtn}
              onPress={() => setReminderModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.reminderBtnText}>Eslatma</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() => onPay(debt)}
              activeOpacity={0.8}
            >
              <Text style={styles.payBtnText}>To'lash</Text>
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
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
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
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  phone: {
    fontSize: 13,
    color: '#2563EB',
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
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  amountItem: {
    alignItems: 'center',
    flex: 1,
  },
  amountLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 3,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '700',
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
    alignItems: 'flex-end',
    marginTop: 4,
  },
  footerLeft: {
    flex: 1,
    marginRight: 8,
    gap: 6,
  },
  dueDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  dueDateOverdue: {
    color: '#DC2626',
    fontWeight: '600',
  },
  ageBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  ageBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reminderBtn: {
    borderWidth: 1,
    borderColor: '#D97706',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderBtnText: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '700',
  },
  payBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
