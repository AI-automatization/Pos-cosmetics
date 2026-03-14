import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DebtSummary } from '../../api/debts.api';
import { Colors, Radii, Shadows } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';

interface DebtSummaryCardsProps {
  data: DebtSummary;
}

export default function DebtSummaryCards({ data }: DebtSummaryCardsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Jami qarz — primary */}
      <View style={[styles.card, styles.cardPrimary]}>
        <Text style={styles.primaryLabel}>{t('debts.totalDebt')}</Text>
        <Text style={styles.primaryAmount}>{formatCurrency(data.totalDebt)}</Text>
      </View>

      {/* Muddati o'tgan — danger */}
      <View style={[styles.card, styles.cardDanger]}>
        <View style={styles.row}>
          <Text style={styles.dangerLabel}>{t('debts.overdueDebt')}</Text>
          <View style={styles.overdueChip}>
            <Text style={styles.overdueChipText}>{data.overdueCount} {t('debts.persons')}</Text>
          </View>
        </View>
        <Text style={styles.dangerAmount}>{formatCurrency(data.overdueDebt)}</Text>
      </View>

      {/* Qarzdorlar count — neutral */}
      <View style={[styles.card, styles.cardNeutral]}>
        <Text style={styles.neutralLabel}>{t('debts.debtorCount')}</Text>
        <Text style={styles.neutralValue}>{data.debtorCount} <Text style={styles.neutralUnit}>ta</Text></Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  card: {
    borderRadius: Radii.lg,
    padding: 16,
    ...Shadows.card,
  },
  // Primary card
  cardPrimary: {
    backgroundColor: Colors.bgSurface,
  },
  primaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  primaryAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  // Danger card
  cardDanger: {
    backgroundColor: Colors.bgSurface,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dangerLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  dangerAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.danger,
  },
  overdueChip: {
    backgroundColor: Colors.dangerLight,
    borderRadius: Radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  overdueChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.danger,
  },
  // Neutral card
  cardNeutral: {
    backgroundColor: Colors.bgSurface,
  },
  neutralLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  neutralValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  neutralUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
