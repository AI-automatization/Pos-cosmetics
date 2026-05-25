import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomerDebt } from '../../api/debts.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors, Radii } from '../../config/theme';

interface QuickPayCustomerInfoProps {
  readonly customer: CustomerDebt;
}

export default function QuickPayCustomerInfo({ customer }: QuickPayCustomerInfoProps) {
  const initials = customer.customerName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <>
      {/* Customer info */}
      <View style={styles.customerInfo}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>{initials}</Text>
        </View>
        <View style={styles.customerDetails}>
          <Text style={styles.customerName}>{customer.customerName}</Text>
          <Text style={styles.customerBranch}>{customer.branchName}</Text>
        </View>
      </View>

      {/* Debt info box */}
      <View style={styles.debtInfoBox}>
        <View style={styles.debtInfoRow}>
          <View style={styles.debtInfoItem}>
            <Text style={styles.debtInfoLabel}>Jami qarz</Text>
            <Text style={styles.debtInfoAmount}>{formatCurrency(customer.totalDebt)}</Text>
          </View>
          {customer.overdueAmount > 0 && (
            <View style={styles.debtInfoItem}>
              <Text style={styles.debtInfoLabelDanger}>Muddati o'tgan</Text>
              <Text style={styles.debtInfoAmountDanger}>{formatCurrency(customer.overdueAmount)}</Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  customerBranch: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  debtInfoBox: {
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: Radii.md,
    padding: 14,
    marginBottom: 16,
  },
  debtInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  debtInfoItem: {
    gap: 2,
  },
  debtInfoLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.warning,
  },
  debtInfoAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.warning,
  },
  debtInfoLabelDanger: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.danger,
  },
  debtInfoAmountDanger: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.danger,
  },
});
