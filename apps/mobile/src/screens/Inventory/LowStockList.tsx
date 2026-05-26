import React, { useCallback, useState, useMemo } from 'react';
import {
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ErrorView from '@/components/common/ErrorView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { inventoryApi } from '@/api';
import { safeQueryFn } from '@/utils/error';
import { useAppStore } from '@/store/app.store';
import { useAuthStore } from '@/store/auth.store';
import type { StockItem } from '@/api/inventory.api';

// ─── Role guard ─────────────────────────────────────────
const ALLOWED_ROLES = ['OWNER', 'ADMIN', 'MANAGER'] as const;

// ─── Row component ──────────────────────────────────────
function LowStockRow({
  item,
  onRestock,
  isSending,
}: {
  item: StockItem;
  onRestock: (item: StockItem) => void;
  isSending: boolean;
}): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.sku}>{item.sku}</Text>
        <Text style={styles.threshold}>
          {t('inventory.threshold')}: {item.threshold}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.qty}>{item.quantity}</Text>
        <Text style={styles.qtyLabel}>{t('inventory.quantity')}</Text>
        <TouchableOpacity
          style={[styles.restockBtn, isSending && styles.restockBtnDisabled]}
          onPress={() => onRestock(item)}
          disabled={isSending}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-up-circle-outline" size={14} color="#FFF" />
          <Text style={styles.restockBtnText}>So'rov</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────
export default function LowStockScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const { selectedBranchId } = useAppStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const hasAccess = ALLOWED_ROLES.includes(
    user?.role as typeof ALLOWED_ROLES[number],
  );

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['inventory', 'low-stock', selectedBranchId],
    queryFn: safeQueryFn<StockItem[]>(() => inventoryApi.getStockLevels({ branchId: selectedBranchId ?? undefined, lowStock: true }), []),
    enabled: hasAccess,
  });

  const filtered = useMemo(() => {
    const items = data ?? [];
    const q = search.toLowerCase().trim();
    if (!q) return items;
    return items.filter((item) =>
      item.productName.toLowerCase().includes(q) ||
      (item.sku ?? '').toLowerCase().includes(q),
    );
  }, [data, search]);

  const restockMutation = useMutation({
    mutationFn: (item: StockItem) =>
      inventoryApi.sendRestockRequest({
        productId: item.productId,
        productName: item.productName,
        currentStock: item.quantity,
      }),
    onSuccess: (_data, item) => {
      setSendingId(null);
      RNAlert.alert('Yuborildi', `"${item.productName}" bo'yicha so'rov omborchiga yuborildi.`);
      void queryClient.invalidateQueries({ queryKey: ['restock-requests'] });
    },
    onError: () => {
      setSendingId(null);
      RNAlert.alert('Xatolik', "So'rov yuborishda xatolik. Qayta urinib ko'ring.");
    },
  });

  const handleRestock = useCallback((item: StockItem) => {
    RNAlert.alert(
      "So'rov yuborish",
      `"${item.productName}" uchun to'ldirish so'rovi yuborilsinmi?`,
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: 'Yuborish',
          onPress: () => {
            setSendingId(item.productId);
            restockMutation.mutate(item);
          },
        },
      ],
    );
  }, [restockMutation]);

  // ─── Role guard screen ──────────────────────────────
  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centerFill}>
          <Ionicons name="lock-closed-outline" size={48} color="#9CA3AF" />
          <Text style={styles.lockText}>Bu bo'lim uchun ruxsat yo'q</Text>
          <Text style={styles.lockSub}>Kerakli rol: Manager, Admin, Owner</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <ScreenLayout
      onRefresh={() => void refetch()}
      isRefreshing={isFetching}
      scrollable={false}
    >
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Mahsulot qidirish..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        {search.length > 0 && (
          <Text style={styles.resultCount}>{filtered.length} ta natija</Text>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <LowStockRow
            item={item}
            onRestock={handleRestock}
            isSending={sendingId === item.productId}
          />
        )}
        ListEmptyComponent={
          <EmptyState title={search ? 'Natija topilmadi' : t('common.noData')} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  lockText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  lockSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: -4,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  resultCount: {
    fontSize: 12,
    color: '#9CA3AF',
    paddingLeft: 4,
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderLeftWidth: 3,
    borderLeftColor: '#f97316',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  sku: {
    fontSize: 12,
    color: '#9ca3af',
  },
  threshold: {
    fontSize: 12,
    color: '#ca8a04',
  },
  qty: {
    fontSize: 28,
    fontWeight: '800',
    color: '#dc2626',
  },
  qtyLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  restockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 2,
  },
  restockBtnDisabled: {
    opacity: 0.5,
  },
  restockBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  separator: {
    height: 8,
  },
});
