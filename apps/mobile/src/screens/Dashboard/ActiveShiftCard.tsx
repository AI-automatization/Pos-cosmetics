import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Shift } from '@raos/types';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { formatDateTime } from '../../utils/date';

interface ActiveShiftCardProps {
  readonly shift: Shift | null;
}

export default function ActiveShiftCard({ shift }: ActiveShiftCardProps) {
  const { t } = useTranslation();

  if (!shift) {
    return (
      <Card>
        <Text style={styles.sectionLabel}>{t('dashboard.activeShift')}</Text>
        <Text style={styles.noShift}>{t('dashboard.noActiveShift')}</Text>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.row}>
        <Text style={styles.sectionLabel}>{t('dashboard.activeShift')}</Text>
        <Badge label="OPEN" variant="success" />
      </View>
      <View style={styles.info}>
        <Text style={styles.infoText}>
          {t('dashboard.opened')}: {formatDateTime(shift.openedAt)}
        </Text>
        {shift.openingCash > 0 && (
          <Text style={styles.infoText}>
            Ochilish naqdi: {shift.openingCash.toLocaleString()} so'm
          </Text>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  noShift: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 4,
  },
  info: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
  },
});
