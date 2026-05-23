import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Shift } from '@raos/types';
import Badge from '../../components/common/Badge';
import { formatDateTime } from '../../utils/date';

interface ActiveShiftCardProps {
  readonly shift: Shift | null;
}

function getShiftLabel(shift: Shift): string {
  return `Smena №${shift.id.slice(-6).toUpperCase()}`;
}

export default function ActiveShiftCard({ shift }: ActiveShiftCardProps) {
  const { t } = useTranslation();

  if (!shift) return null;

  return (
    <View style={styles.container}>
      {/* Sarlavha */}
      <View style={styles.headerRow}>
        <Text style={styles.label}>{t('dashboard.activeShift')}</Text>
        <Badge label="OCHIQ" variant="success" />
      </View>

      {/* Smena raqami */}
      <Text style={styles.shiftNumber}>{getShiftLabel(shift)}</Text>

      {/* Stats grid */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>OCHILGAN VAQT</Text>
          <Text style={styles.statValue}>{formatDateTime(shift.openedAt)}</Text>
        </View>
        {shift.openingCash > 0 && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>OCHILISH NAQDI</Text>
            <Text style={styles.statValue}>
              {shift.openingCash.toLocaleString()} so'm
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    padding: 16,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  shiftNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});
