// Ombor screen — stock levels with stats, search, filter tabs
import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OmborTabStackParamList } from '../../navigation/types';
import { useOmborData } from './useOmborData';
import { C } from './OmborColors';
import { getStatus, type FilterTab } from './OmborTypes';
import OmborHeader from './OmborHeader';
import OmborProductCard from './OmborProductCard';
import OmborEmptyState from './OmborEmptyState';
import OmborListHeader from './OmborListHeader';

type OmborNav = NativeStackNavigationProp<OmborTabStackParamList, 'OmborMain'>;

export default function OmborScreen() {
  const navigation = useNavigation<OmborNav>();
  const [search, setSearch]                 = useState('');
  const [activeTab, setActiveTab]           = useState<FilterTab>('ALL');
  const [activeWarehouse, setActiveWarehouse] = useState<string | null>(null);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const searchRef = useRef<TextInput>(null);

  const { stockLevels } = useOmborData();
  const { data, isLoading, isError, refetch } = stockLevels;

  const allItems = data ?? [];

  const warehouses = useMemo(
    () => [...new Set(allItems.map((i) => i.warehouseName))].sort(),
    [allItems],
  );

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
      const matchWarehouse =
        activeWarehouse === null || item.warehouseName === activeWarehouse;
      return matchSearch && matchTab && matchWarehouse;
    });
  }, [search, activeTab, activeWarehouse, allItems]);

  const headerComponent = (
    <OmborHeader
      onScanPress={() => searchRef.current?.focus()}
      onFilterPress={() => setShowWarehouseModal(true)}
      onInvoicesPress={() => navigation.navigate('InvoicesScreen')}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        {headerComponent}
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        {headerComponent}
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      {headerComponent}

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
            inputRef={searchRef}
          />
        }
        renderItem={({ item }) => <OmborProductCard item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<OmborEmptyState />}
      />

      {/* Ombor filter modal */}
      <Modal
        visible={showWarehouseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWarehouseModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWarehouseModal(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Ombor tanlash</Text>
            <ScrollView>
              <TouchableOpacity
                style={[styles.warehouseRow, activeWarehouse === null && styles.warehouseRowActive]}
                onPress={() => { setActiveWarehouse(null); setShowWarehouseModal(false); }}
              >
                <Text style={[styles.warehouseLabel, activeWarehouse === null && styles.warehouseLabelActive]}>
                  Barcha omborlar
                </Text>
                {activeWarehouse === null && <Ionicons name="checkmark" size={18} color={C.primary} />}
              </TouchableOpacity>
              {warehouses.map((wh) => (
                <TouchableOpacity
                  key={wh}
                  style={[styles.warehouseRow, activeWarehouse === wh && styles.warehouseRowActive]}
                  onPress={() => { setActiveWarehouse(wh); setShowWarehouseModal(false); }}
                >
                  <Text style={[styles.warehouseLabel, activeWarehouse === wh && styles.warehouseLabelActive]}>
                    {wh}
                  </Text>
                  {activeWarehouse === wh && <Ionicons name="checkmark" size={18} color={C.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  warehouseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  warehouseRowActive: {
    backgroundColor: '#EFF6FF',
  },
  warehouseLabel: {
    fontSize: 14,
    color: C.text,
  },
  warehouseLabelActive: {
    color: C.primary,
    fontWeight: '600',
  },
});
