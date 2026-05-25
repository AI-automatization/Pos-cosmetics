import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/common/Card';
import ErrorView from '@/components/common/ErrorView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useDebtorDetail, useSendReminder } from '@/hooks/useNasiya';
import { formatCurrency } from '@/utils/format';
import { extractErrorMessage } from '@/utils/error';
import type { NasiyaStackParamList } from '@/navigation/types';
import PaymentForm, { PaymentRow } from './DebtPaymentForm';
import { styles } from './DebtDetail.styles';

type RouteProps = RouteProp<NasiyaStackParamList, 'DebtDetail'>;

export default function DebtDetailScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const route = useRoute<RouteProps>();
  const { debtorId, customerName } = route.params;

  const { data, isLoading, error, refetch } = useDebtorDetail(debtorId);
  const sendReminder = useSendReminder();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorView error={error} onRetry={refetch} />;
  if (!data) return <ErrorView error={new Error(t('common.noData'))} onRetry={refetch} />;

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
        <PaymentForm
          debtorId={debtorId}
          maxAmount={data.totalDebt}
          onSuccess={() => {
            setShowPaymentForm(false);
            void refetch();
          }}
        />
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
