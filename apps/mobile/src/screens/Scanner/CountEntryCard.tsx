import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { CountEntry } from './useScannerData';

interface Props {
  entry: CountEntry;
}

export default function CountEntryCard({ entry }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const diff = entry.actualQty - entry.systemQty;

  const discrepancyLabel =
    diff === 0
      ? t('scanner.discrepancyOk')
      : diff > 0
        ? `+${diff} ${t('scanner.discrepancyOver')}`
        : `${diff} ${t('scanner.discrepancyShort')}`;

  const diffStyle =
    diff === 0
      ? styles.diffOk
      : diff > 0
        ? styles.diffOver
        : styles.diffShort;

  return (
    <View style={styles.card}>
      <Text style={styles.name} numberOfLines={1}>
        {entry.productName}
      </Text>
      <Text style={styles.barcode}>{entry.barcode}</Text>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.colLabel}>{t('scanner.systemQty')}</Text>
          <Text style={styles.colValue}>{entry.systemQty}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.colLabel}>{t('scanner.actualQty')}</Text>
          <Text style={styles.colValue}>{entry.actualQty}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.colLabel}>{t('scanner.discrepancy')}</Text>
          <Text style={[styles.colValue, diffStyle]}>{discrepancyLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  barcode: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    paddingVertical: 6,
  },
  colLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  colValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  diffOk: {
    color: '#059669',
  },
  diffOver: {
    color: '#D97706',
  },
  diffShort: {
    color: '#DC2626',
  },
});
