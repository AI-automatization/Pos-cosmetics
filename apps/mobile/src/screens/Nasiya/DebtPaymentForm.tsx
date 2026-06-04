import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { useRecordPayment } from '@/hooks/useNasiya';
import { formatCurrency, formatRelativeTime } from '@/utils/format';
import { extractErrorMessage } from '@/utils/error';
import type { DebtPayment } from '@/api/nasiya.api';
import { styles } from './DebtDetail.styles';
import { NASIYA_PAYMENT_METHODS, NASIYA_METHOD_TO_ENUM } from './payment-method.constants';

// ─── PaymentRow ───────────────────────────────────────────
export function PaymentRow({ item }: { readonly item: DebtPayment }): React.JSX.Element {
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

// ─── PaymentForm ──────────────────────────────────────────
interface PaymentFormProps {
  readonly debtorId: string;
  readonly maxAmount: number;
  readonly onSuccess: () => void;
}

export default function PaymentForm({
  debtorId,
  maxAmount,
  onSuccess,
}: PaymentFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const recordPayment = useRecordPayment();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>(NASIYA_PAYMENT_METHODS[0]);
  const [note, setNote] = useState('');

  const handleSubmit = (): void => {
    const parsedAmount = parseFloat(amount.replace(/\s/g, ''));
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert(t('common.error'), t('nasiya.invalidAmount'));
      return;
    }
    if (parsedAmount > maxAmount) {
      Alert.alert(t('common.error'), t('nasiya.amountExceedsDebt'));
      return;
    }
    recordPayment.mutate(
      {
        debtorId,
        amount: parsedAmount,
        paymentMethod: NASIYA_METHOD_TO_ENUM[selectedMethod as keyof typeof NASIYA_METHOD_TO_ENUM],
        note: note || undefined,
      },
      {
        onSuccess: () => {
          setAmount('');
          setNote('');
          onSuccess();
        },
        onError: (err) => {
          Alert.alert(t('common.error'), extractErrorMessage(err));
        },
      },
    );
  };

  return (
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
        {NASIYA_PAYMENT_METHODS.map((m) => (
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
        onPress={handleSubmit}
        disabled={recordPayment.isPending}
      >
        <Text style={styles.primaryBtnText}>
          {recordPayment.isPending ? t('common.loading') : t('common.save')}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}
