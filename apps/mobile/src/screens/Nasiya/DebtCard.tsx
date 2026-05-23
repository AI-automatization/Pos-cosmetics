import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DebtRecord } from '../../api/nasiya.api';
import { formatUZS } from '../../utils/currency';
import ReminderActionSheet from './ReminderActionSheet';
import { styles } from './DebtCard.styles';
import {
  STATUS_COLORS,
  PROGRESS_COLOR,
  statusLabel,
  overdueDays,
  formatDueDate,
  ageBucket,
} from './DebtCard.helpers';

interface Props {
  debt: DebtRecord;
  onPay: (debt: DebtRecord) => void;
  onPress?: (debt: DebtRecord) => void;
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

      {/* Amounts -- 3-ustunli grid */}
      <View style={styles.amounts}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Jami</Text>
          <Text style={styles.amountValue}>{formatUZS(Number(debt.totalAmount))}</Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>To'langan</Text>
          <Text style={[styles.amountValue, styles.amountValueGreen]}>
            {formatUZS(Number(debt.paidAmount))}
          </Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Qoldiq</Text>
          <Text style={[styles.amountValue, styles.amountValueRed]}>
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
          <Text style={styles.historyChevron}>{paymentsExpanded ? '\u25B2' : '\u25BC'}</Text>
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

      {/* Footer -- due date + age badge + buttons */}
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
