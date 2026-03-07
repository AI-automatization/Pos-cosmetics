import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DebtRecord } from '../../api/nasiya.api';
import { formatUZS } from '../../utils/currency';

interface Props {
  debt: DebtRecord;
}

export default function DebtSummary({ debt }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.summary}>
      <Text style={styles.customer}>{debt.customer.name}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{t('nasiya.remaining')}:</Text>
        <Text style={styles.remaining}>{formatUZS(Number(debt.remaining))}</Text>
      </View>
      {Number(debt.paidAmount) > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>{t('nasiya.paid')}:</Text>
          <Text style={styles.paid}>{formatUZS(Number(debt.paidAmount))}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  customer: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: { fontSize: 14, color: '#6B7280' },
  remaining: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  paid: { fontSize: 14, fontWeight: '600', color: '#16A34A' },
});
