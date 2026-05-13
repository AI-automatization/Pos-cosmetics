import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { CustomerDebt } from '../../api/debts.api';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Colors, Radii } from '../../config/theme';

interface CustomerDebtRowProps {
  item: CustomerDebt;
  onPay?: (item: CustomerDebt) => void;
}

export default function CustomerDebtRow({ item, onPay }: CustomerDebtRowProps) {
  const { t } = useTranslation();
  const isOverdue = item.daysSinceLastPayment > 30;
  const initials = item.customerName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, isOverdue && styles.avatarOverdue]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.left}>
        <Text style={styles.name}>{item.customerName}</Text>
        <Text style={styles.meta}>{item.branchName}</Text>
        <Text style={styles.meta}>{t('debts.lastPurchase')}: {formatDate(item.lastPurchaseDate)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, isOverdue && styles.amountOverdue]}>{formatCurrency(item.totalDebt)}</Text>
        <Text style={styles.days}>{item.daysSinceLastPayment} {t('debts.days')}</Text>
        {isOverdue && <Badge label={t('debts.overdue')} variant="error" />}
        {onPay && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => onPay(item)}
            activeOpacity={0.75}
          >
            <Ionicons name="wallet-outline" size={14} color="#FFFFFF" />
            <Text style={styles.payBtnText}>{t('debts.pay', { defaultValue: "To'lash" })}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
    backgroundColor: Colors.bgSurface,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarOverdue: { backgroundColor: Colors.dangerLight },
  avatarText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  left: { flex: 1, gap: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  name: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  meta: { fontSize: 12, color: Colors.textSecondary },
  amount: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  amountOverdue: { color: Colors.danger },
  days: { fontSize: 12, color: Colors.textMuted },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.sm,
    marginTop: 2,
  },
  payBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
