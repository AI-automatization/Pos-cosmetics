import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNasiyaData, type FilterTab } from './useNasiyaData';
import DebtCard from './DebtCard';
import PayModal from './PayModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorView from '../../components/common/ErrorView';
import EmptyState from '../../components/common/EmptyState';
import { formatUZS, formatCompact } from '../../utils/currency';
import type { DebtRecord } from '../../api/nasiya.api';

const TABS: { key: FilterTab; labelKey: string }[] = [
  { key: 'ALL',     labelKey: 'nasiya.tabAll' },
  { key: 'OVERDUE', labelKey: 'nasiya.tabOverdue' },
  { key: 'PAID',    labelKey: 'nasiya.tabPaid' },
];

export default function NasiyaScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [selectedDebt, setSelectedDebt] = useState<DebtRecord | null>(null);
  const [payModalVisible, setPayModalVisible] = useState(false);

  const {
    currentItems,
    totalDebt,
    overdueCount,
    overdueAmount,
    isLoading,
    isFetching,
    error,
    refetchAll,
  } = useNasiyaData(activeTab);

  const handlePay = (debt: DebtRecord) => {
    setSelectedDebt(debt);
    setPayModalVisible(true);
  };

  const handlePaySuccess = () => {
    refetchAll();
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView error={error} onRetry={refetchAll} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('nasiya.title')}</Text>
      </View>

      {/* Summary cards */}
      <View style={styles.summary}>
        <View style={[styles.summaryCard, styles.summaryCardDebt]}>
          <Text style={styles.summaryCardLabel}>{t('nasiya.totalDebt')}</Text>
          <Text style={styles.summaryCardValue} numberOfLines={1}>
            {formatCompact(totalDebt)}
          </Text>
          <Text style={styles.summaryCardSub}>{formatUZS(totalDebt)}</Text>
        </View>

        <View style={[styles.summaryCard, styles.summaryCardOverdue]}>
          <Text style={styles.summaryCardLabel}>{t('nasiya.overdueLabel')}</Text>
          <Text style={[styles.summaryCardValue, { color: '#DC2626' }]} numberOfLines={1}>
            {overdueCount > 0 ? `${overdueCount} ta` : '0'}
          </Text>
          {overdueAmount > 0 && (
            <Text style={[styles.summaryCardSub, { color: '#DC2626' }]}>
              {formatCompact(overdueAmount)}
            </Text>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {t(tab.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Debt list */}
      <FlatList<DebtRecord>
        data={currentItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DebtCard debt={item} onPay={handlePay} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="💸" message={t('nasiya.noDebts')} />
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetchAll}
            tintColor="#6366F1"
          />
        }
      />

      {/* Pay modal */}
      <PayModal
        debt={selectedDebt}
        visible={payModalVisible}
        onClose={() => setPayModalVisible(false)}
        onSuccess={handlePaySuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  summary: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardDebt: {
    backgroundColor: '#EEF2FF',
  },
  summaryCardOverdue: {
    backgroundColor: '#FEF2F2',
  },
  summaryCardLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryCardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6366F1',
  },
  summaryCardSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
});
