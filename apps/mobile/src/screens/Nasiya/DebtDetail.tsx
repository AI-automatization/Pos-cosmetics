import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/common/Card';
import ErrorView from '@/components/common/ErrorView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Badge from '@/components/common/Badge';
import { useDebtorDetail, useRecordPayment, useSendReminder } from '@/hooks/useNasiya';
import { formatCurrency, formatRelativeTime } from '@/utils/format';
import { extractErrorMessage } from '@/utils/error';
import type { NasiyaStackParamList } from '@/navigation/types';
import type { DebtPayment } from '@/api/nasiya.api';

type RouteProps = RouteProp<NasiyaStackParamList, 'DebtDetail'>;

const PAYMENT_METHODS = ['Naqd', 'Karta', 'Bank transfer'] as const;

function PaymentRow({ item }: { item: DebtPayment }): React.JSX.Element {
  return (
    <View style={styles.paymentRow}>
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentAmount}>{formatCurrency(item.amount, item.currency)}</Text>
        {item.note && <Text style={styles.paymentNote}>{item.note}</Text>}
      </View>
      <View style={styles.paymentRight}>
        <Badge label={item.paymentMethod} variant="info" />
        <Text style={styles.paymentTime}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
    </View>
  );
}

export default function DebtDetailScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const route = useRoute<RouteProps>();
  const { debtorId, customerName } = route.params;

  const { data, isLoading, error, refetch } = useDebtorDetail(debtorId);
  const recordPayment = useRecordPayment();
  const sendReminder = useSendReminder();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [note, setNote] = useState('');

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorView error={error} onRetry={refetch} />;
  if (!data) return <ErrorView error={new Error(t('common.noData'))} onRetry={refetch} />;

  const handleRecordPayment = (): void => {
    const parsedAmount = parseFloat(amount.replace(/\s/g, ''));
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert(t('common.error'), t('nasiya.invalidAmount'));
      return;
    }
    if (parsedAmount > data.totalDebt) {
      Alert.alert(t('common.error'), t('nasiya.amountExceedsDebt'));
      return;
    }
    recordPayment.mutate(
      { debtorId, amount: parsedAmount, paymentMethod: selectedMethod, note: note || undefined },
      {
        onSuccess: () => {
          setShowPaymentForm(false);
          setAmount('');
          setNote('');
          void refetch();
        },
        onError: (err) => {
          Alert.alert(t('common.error'), extractErrorMessage(err));
        },
      },
    );
  };

  const handleSendReminder = (): void => {
    Alert.alert(
      t('nasiya.sendReminderTitle'),
      t('nasiya.sendReminderMsg', { name: customerName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('nasiya.send'),
          onPress: () => {
            sendReminder.mutate(debtorId, {
              onSuccess: () => Alert.alert('✅', t('nasiya.reminderSent')),
              onError: (err) => Alert.alert(t('common.error'), extractErrorMessage(err)),
            });
          },
        },
      ],
    );
  };

  return (
    <ScreenLayout title={customerName} onRefresh={refetch} isRefreshing={isLoading}>
      {/* Debt Summary */}
      <Card>
        <View style={styles.debtSummary}>
          <View style={styles.debtSummaryItem}>
            <Text style={styles.debtTotal}>{formatCurrency(data.totalDebt, data.currency)}</Text>
            <Text style={styles.debtTotalLabel}>{t('nasiya.totalDebt')}</Text>
          </View>
          {data.overdueAmount > 0 && (
            <View style={styles.debtSummaryItem}>
              <Text style={styles.debtOverdue}>{formatCurrency(data.overdueAmount, data.currency)}</Text>
              <Text style={styles.debtOverdueLabel}>{t('nasiya.overdue')}</Text>
            </View>
          )}
        </View>
        <View style={styles.contactRow}>
          <Text style={styles.contactPhone}>{data.customerPhone}</Text>
          {data.dueDate && (
            <Text style={styles.dueDate}>
              {t('nasiya.dueDate')}: {data.dueDate.slice(0, 10)}
            </Text>
          )}
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setShowPaymentForm((v) => !v)}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>
            {showPaymentForm ? t('common.cancel') : t('nasiya.recordPayment')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleSendReminder}
          disabled={sendReminder.isPending}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>{t('nasiya.sendReminder')}</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Form */}
      {showPaymentForm && (
        <Card>
          <Text style={styles.formTitle}>{t('nasiya.recordPayment')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('nasiya.amountPlaceholder')}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={styles.fieldLabel}>{t('nasiya.paymentMethod')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodRow}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.methodChip, selectedMethod === m && styles.methodChipActive]}
                onPress={() => setSelectedMethod(m)}
              >
                <Text style={[styles.methodChipText, selectedMethod === m && styles.methodChipTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput
            style={styles.input}
            placeholder={t('nasiya.notePlaceholder')}
            value={note}
            onChangeText={setNote}
          />
          <TouchableOpacity
            style={[styles.primaryBtn, recordPayment.isPending && styles.btnDisabled]}
            onPress={handleRecordPayment}
            disabled={recordPayment.isPending}
          >
            <Text style={styles.primaryBtnText}>
              {recordPayment.isPending ? t('common.loading') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Payment History */}
      <Text style={styles.sectionTitle}>{t('nasiya.paymentHistory')}</Text>
      {data.payments.length > 0 ? (
        <Card>
          <FlatList
            data={data.payments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PaymentRow item={item} />}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Card>
      ) : (
        <Card>
          <Text style={styles.emptyText}>{t('nasiya.noPayments')}</Text>
        </Card>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  debtSummary: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 8,
  },
  debtSummaryItem: {
    alignItems: 'flex-start',
  },
  debtTotal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#dc2626',
  },
  debtTotalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  debtOverdue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f97316',
  },
  debtOverdueLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactPhone: {
    fontSize: 14,
    color: '#374151',
  },
  dueDate: {
    fontSize: 13,
    color: '#6b7280',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#1a56db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  methodRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  methodChipActive: {
    backgroundColor: '#1a56db',
    borderColor: '#1a56db',
  },
  methodChipText: {
    fontSize: 13,
    color: '#374151',
  },
  methodChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    marginTop: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10b981',
  },
  paymentNote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
