import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import EmptyState from '../../components/common/EmptyState';
import CountEntryCard from './CountEntryCard';
import type { CountEntry } from './useScannerData';

interface Props {
  countEntries: CountEntry[];
  totalSystemQty: number;
  totalActualQty: number;
  onClear: () => void;
  onStartScan: () => void;
}

export default function CountSection({
  countEntries,
  totalSystemQty,
  totalActualQty,
  onClear,
  onStartScan,
}: Props) {
  const { t } = useTranslation();
  const diff = totalActualQty - totalSystemQty;

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {countEntries.length} {t('scanner.countItems')}
        </Text>
        {countEntries.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <Text style={styles.clearText}>{t('scanner.countClear')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {countEntries.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {t('scanner.systemQty')}: {totalSystemQty} |{' '}
            {t('scanner.actualQty')}: {totalActualQty} |{' '}
            {t('scanner.discrepancy')}: {diff >= 0 ? '+' : ''}{diff}
          </Text>
        </View>
      )}

      <FlatList<CountEntry>
        data={countEntries}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => <CountEntryCard entry={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState icon="📋" message={t('scanner.noCountItems')} />
        }
      />

      <TouchableOpacity style={styles.scanBtn} onPress={onStartScan}>
        <Text style={styles.scanBtnText}>📷 {t('scanner.modeScan')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  clearText: { fontSize: 14, color: '#DC2626', fontWeight: '500' },
  summaryBar: { backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 8 },
  summaryText: { fontSize: 13, color: '#4338CA', fontWeight: '500' },
  listContent: { padding: 16, flexGrow: 1 },
  scanBtn: {
    margin: 16,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  scanBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
