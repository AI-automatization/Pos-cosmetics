// Ombor screen — stock levels with stats, search, filter tabs and request sheet
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOmborData } from './useOmborData';
import OmborRequestSheet from './OmborRequestSheet';
import ShiftGuard from '../../components/common/ShiftGuard';
import { C } from './OmborColors';
import { getStatus, type FilterTab } from './OmborTypes';
import OmborHeader from './OmborHeader';
import OmborProductCard from './OmborProductCard';
import OmborEmptyState from './OmborEmptyState';
import OmborListHeader from './OmborListHeader';

export default function OmborScreen() {
  const [search, setSearch]                           = useState('');
  const [activeTab, setActiveTab]                     = useState<FilterTab>('ALL');
  const [requestSheetVisible, setRequestSheetVisible] = useState(false);

  const { stockLevels } = useOmborData();
  const { data, isLoading, isError, refetch } = stockLevels;

  const allItems = data ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allItems.filter((item) => {
      const matchSearch =
        item.productName.toLowerCase().includes(q) ||
        item.warehouseName.toLowerCase().includes(q);
      const status = getStatus(item);
      const matchTab =
        activeTab === 'ALL' ||
        (activeTab === 'KAM'    && status === 'KAM')    ||
        (activeTab === 'TUGADI' && status === 'TUGADI');
      return matchSearch && matchTab;
    });
  }, [search, activeTab, allItems]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <OmborHeader />
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <OmborHeader />
        <View style={styles.centerFill}>
          <Ionicons name="alert-circle-outline" size={48} color={C.muted} />
          <Text style={styles.errorText}>Ma'lumot yuklanmadi</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => refetch()}
            activeOpacity={0.75}
          >
            <Text style={styles.retryBtnText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ShiftGuard>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <OmborHeader />

        <FlatList
          data={filtered}
          keyExtractor={(item) => `${item.productId}-${item.warehouseId}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <OmborListHeader
              allItems={allItems}
              search={search}
              activeTab={activeTab}
              resultCount={filtered.length}
              onSearchChange={setSearch}
              onTabChange={setActiveTab}
            />
          }
          renderItem={({ item }) => <OmborProductCard item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<OmborEmptyState />}
        />

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.requestBtn}
            onPress={() => setRequestSheetVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="clipboard-outline" size={20} color={C.white} />
            <Text style={styles.requestBtnText}>Katta omborga so'rov yuborish</Text>
          </TouchableOpacity>
        </View>

        <OmborRequestSheet
          visible={requestSheetVisible}
          onClose={() => setRequestSheetVisible(false)}
          items={allItems}
        />
      </SafeAreaView>
    </ShiftGuard>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 100,
  },
  separator: {
    height: 10,
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 15,
    color: C.muted,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.primary,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
  bottomBar: {
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.primary,
  },
  requestBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
});
