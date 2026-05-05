import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomerDebt } from '../../api/debts.api';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Colors, Radii } from '../../config/theme';

interface CustomerDebtRowProps {
  item: CustomerDebt;
}

export default function CustomerDebtRow({ item }: CustomerDebtRowProps) {
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
});
