// index.tsx — Muddati o'tganlar ekrani

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/auth.store';
import { useExpiryData } from './useExpiryData';
import { ExpiryHeader } from './ExpiryHeader';
import { ExpiryListHeader } from './ExpiryListHeader';
import { ExpiryProductCard } from './ExpiryProductCard';
import { C, EXPIRY_ROLES } from './ExpiryColors';
import type { ExpiryItem, ExpiredItem, ExpiryTab, DaysFilter } from './ExpiryTypes';

type NavProp = NativeStackNavigationProp<MoreStackParamList, 'ExpiryScreen'>;

function keyExtractor(item: ExpiryItem | ExpiredItem, tab: ExpiryTab): string {
  if (tab === 'EXPIRING') {
    const e = item as ExpiryItem;
    return `exp-${e.productId}-${e.warehouseId}`;
  }
  const d = item as ExpiredItem;
  return `expd-${d.productId}-${d.batchNumber ?? 'no-batch'}`;
}

export default function ExpiryScreen() {
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const { user }   = useAuthStore();

  const [tab, setTab]               = useState<ExpiryTab>('EXPIRING');
  const [daysFilter, setDaysFilter] = useState<DaysFilter>(30);
  const [search, setSearch]         = useState('');

  const hasAccess = EXPIRY_ROLES.includes(
    user?.role as typeof EXPIRY_ROLES[number],
  );

  const { expiring, expired } = useExpiryData(daysFilter);

  const allExpiring: ExpiryItem[]  = expiring.data ?? [];
  const allExpired:  ExpiredItem[] = expired.data  ?? [];

  const filteredExpiring = useMemo<ExpiryItem[]>(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allExpiring;
    return allExpiring.filter(
      (item) =>
        item.productName.toLowerCase().includes(q) ||
        item.warehouseName.toLowerCase().includes(q) ||
        (item.batchNumber?.toLowerCase().includes(q) ?? false),
    );
  }, [search, allExpiring]);

  const filteredExpired = useMemo<ExpiredItem[]>(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allExpired;
    return allExpired.filter(
      (item) =>
        item.productName.toLowerCase().includes(q) ||
        (item.batchNumber?.toLowerCase().includes(q) ?? false),
    );
  }, [search, allExpired]);

  const activeData: (ExpiryItem | ExpiredItem)[] =
    tab === 'EXPIRING' ? filteredExpiring : filteredExpired;

  const isLoading = tab === 'EXPIRING' ? expiring.isLoading : expired.isLoading;
  const isError   = tab === 'EXPIRING' ? expiring.isError   : expired.isError;
  const refetch   = tab === 'EXPIRING' ? expiring.refetch   : expired.refetch;

  const handleBack      = useCallback(() => navigation.goBack(), [navigation]);
  const handleRetry     = useCallback(() => { void refetch(); }, [refetch]);
  const handleTabChange = useCallback((newTab: ExpiryTab) => setTab(newTab), []);
  const handleDaysChange = useCallback((d: DaysFilter) => setDaysFilter(d), []);
  const handleSearchChange = useCallback((v: string) => setSearch(v), []);

  const renderItem = useCallback(
    ({ item }: { item: ExpiryItem | ExpiredItem }) => (
      <ExpiryProductCard item={item} tab={tab} />
    ),
    [tab],
  );

  const renderKeyExtractor = useCallback(
    (item: ExpiryItem | ExpiredItem) => keyExtractor(item, tab),
    [tab],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.empty}>
        <Ionicons name="checkmark-circle-outline" size={48} color={C.green} />
        <Text style={styles.emptyText}>
          {tab === 'EXPIRING'
            ? t('warehouse.expiringNoItems')
            : t('warehouse.expiredNoItems')}
        </Text>
      </View>
    ),
    [tab],
  );

  const renderListHeader = useCallback(
    () => (
      <ExpiryListHeader
        tab={tab}
        onTabChange={handleTabChange}
        daysFilter={daysFilter}
        onDaysChange={handleDaysChange}
        search={search}
        onSearchChange={handleSearchChange}
        expiringCount={allExpiring.length}
        expiredCount={allExpired.length}
        resultCount={activeData.length}
      />
    ),
    [
      tab, handleTabChange,
      daysFilter, handleDaysChange,
      search, handleSearchChange,
      allExpiring.length, allExpired.length, activeData.length,
    ],
  );

  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ExpiryHeader onBack={handleBack} />
        <View style={styles.centerFill}>
          <Ionicons name="lock-closed-outline" size={48} color={C.muted} />
          <Text style={styles.errorText}>{t('warehouse.noPermission')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ExpiryHeader onBack={handleBack} />
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ExpiryHeader onBack={handleBack} />
        <View style={styles.centerFill}>
          <Ionicons name="alert-circle-outline" size={48} color={C.muted} />
          <Text style={styles.errorText}>{t('warehouse.dataLoadError')}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={handleRetry}
            activeOpacity={0.75}
          >
            <Text style={styles.retryBtnText}>{t('warehouse.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ExpiryHeader onBack={handleBack} />
      <FlatList
        data={activeData}
        keyExtractor={renderKeyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  content:      { paddingBottom: 32 },
  centerFill:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText:    { fontSize: 15, color: C.muted },
  retryBtn:     { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10, backgroundColor: C.primary },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
  separator:    { height: 10 },
  empty:        { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:    { fontSize: 15, color: C.muted },
});
