import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { promotionsApi } from '@/api';
import type { Promotion } from '@/api';
import type { MoreStackParamList } from '../../navigation/types';
import EmptyState from '@/components/common/EmptyState';
import ErrorView from '@/components/common/ErrorView';
import DiscountCard from './DiscountCard';
import CreateDiscountModal from './CreateDiscountModal';
import { styles, C } from './ChegirmaScreen.styles';

type Nav = NativeStackNavigationProp<MoreStackParamList>;

// ─── Constants ────────────────────────────────────────────────────────────────

type FilterKey = 'ALL' | 'ACTIVE' | 'ENDED';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL',    label: 'Barchasi' },
  { key: 'ACTIVE', label: 'Faol' },
  { key: 'ENDED',  label: 'Yakunlangan' },
];

const QUERY_KEY = ['promotions', 'discounts'] as const;

// ─── ChegirmaScreen ───────────────────────────────────────────────────────────

export default function ChegirmaScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab]         = useState<FilterKey>('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => promotionsApi.getAll(),
    staleTime: 30_000,
  });

  const discounts = useMemo(() => {
    const base = (data ?? []).filter(
      (p) => p.type === 'PERCENT' || p.type === 'FIXED',
    );
    if (tab === 'ACTIVE') return base.filter((p) => p.isActive);
    if (tab === 'ENDED')  return base.filter((p) => !p.isActive);
    return base;
  }, [data, tab]);

  const keyExtractor = useCallback((item: Promotion) => item.id, []);
  const renderItem   = useCallback(
    ({ item }: { item: Promotion }) => <DiscountCard item={item} />,
    [],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chegirmalar</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ActivityIndicator style={styles.loader} size="large" color={C.primary} />
      </SafeAreaView>
    );
  }

  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  const allDiscounts = (data ?? []).filter(
    (p) => p.type === 'PERCENT' || p.type === 'FIXED',
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chegirmalar</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalOpen(true)}>
          <Ionicons name="add" size={24} color={C.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const count =
            f.key === 'ALL'    ? allDiscounts.length :
            f.key === 'ACTIVE' ? allDiscounts.filter((p) => p.isActive).length :
                                 allDiscounts.filter((p) => !p.isActive).length;
          const active = tab === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setTab(f.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                {f.label}
              </Text>
              <Text style={[styles.filterCount, active && styles.filterCountActive]}>
                {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={discounts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState title="Chegirma topilmadi" />}
      />

      {/* Create modal */}
      <CreateDiscountModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </SafeAreaView>
  );
}
