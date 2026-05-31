// IncomingTransfersScreen — CASHIER: kelgan mahsulotlarni qabul qilish
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { StockTransferListItem } from '../../api/inventory.api';

const C = {
  primary: '#2563EB',
  success: '#16A34A',
  bg: '#F9FAFB',
  white: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  shipped: '#D97706',
  shippedBg: '#FFFBEB',
};

export default function IncomingTransfersScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [actingId, setActingId] = useState<string | null>(null);

  const transfers = useQuery({
    queryKey: ['incoming-transfers'],
    queryFn: () => inventoryApi.listTransfers({ status: 'SHIPPED' }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const items = transfers.data?.items ?? [];

  const receiveMutation = useMutation({
    mutationFn: (id: string) => inventoryApi.receiveTransfer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['incoming-transfers'] });
      void queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      Alert.alert(t('transfers.receiveSuccess'), t('transfers.receiveSuccessMessage'));
    },
    onError: () => {
      Alert.alert(t('common.error'), t('transfers.receiveError'));
    },
    onSettled: () => {
      setActingId(null);
    },
  });

  const handleReceive = useCallback((transfer: StockTransferListItem) => {
    const itemCount = transfer.items.length;
    const msg = t('transfers.receiveConfirm', { from: transfer.fromBranch.name, count: itemCount });
    Alert.alert(t('transfers.receiveTitle'), msg, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('transfers.accept'),
        onPress: () => {
          setActingId(transfer.id);
          receiveMutation.mutate(transfer.id);
        },
      },
    ]);
  }, [receiveMutation, t]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderItem = useCallback(({ item }: { item: StockTransferListItem }) => {
    const isActing = actingId === item.id;

    return (
      <View style={styles.card}>
        {/* Header: from branch + date */}
        <View style={styles.cardHeader}>
          <View style={styles.fromRow}>
            <Ionicons name="business-outline" size={14} color={C.shipped} />
            <Text style={styles.fromText}>{item.fromBranch.name}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* Items list */}
        <View style={styles.itemsList}>
          {item.items.map((p) => (
            <View key={p.id} style={styles.productRow}>
              <Text style={styles.productName} numberOfLines={1}>{p.product.name}</Text>
              <Text style={styles.productQty}>{p.quantity} {t('transfers.unit')}</Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        {item.notes ? (
          <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
        ) : null}

        {/* Receive button */}
        <TouchableOpacity
          style={[styles.receiveBtn, isActing && styles.receiveBtnDisabled]}
          onPress={() => handleReceive(item)}
          activeOpacity={0.75}
          disabled={isActing}
        >
          {isActing ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color={C.white} />
              <Text style={styles.receiveBtnText}>{t('transfers.accept')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }, [actingId, handleReceive]);

  const keyExtractor = useCallback((item: StockTransferListItem) => item.id, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('transfers.incoming')}</Text>
        <View style={styles.headerRight}>
          {items.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{items.length}</Text>
            </View>
          )}
        </View>
      </View>

      {transfers.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={transfers.isFetching && !transfers.isLoading}
              onRefresh={() => { void transfers.refetch(); }}
              tintColor={C.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={48} color={C.muted} />
              <Text style={styles.emptyTitle}>{t('transfers.emptyTitle')}</Text>
              <Text style={styles.emptySubtitle}>{t('transfers.emptySubtitle')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: C.text, marginLeft: 8 },
  headerRight: { width: 36, alignItems: 'center' },
  countBadge: {
    backgroundColor: C.shipped,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: { fontSize: 11, fontWeight: '800', color: C.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 4,
    borderLeftColor: C.shipped,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fromRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fromText: { fontSize: 14, fontWeight: '600', color: C.shipped },
  dateText: { fontSize: 12, color: C.muted },
  itemsList: { gap: 6 },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  productName: { flex: 1, fontSize: 13, fontWeight: '500', color: C.text },
  productQty: { fontSize: 13, fontWeight: '700', color: C.primary, marginLeft: 8 },
  notes: { fontSize: 12, color: C.muted, fontStyle: 'italic' },
  receiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.success,
    borderRadius: 10,
    paddingVertical: 12,
  },
  receiveBtnDisabled: { opacity: 0.6 },
  receiveBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: C.text },
  emptySubtitle: { fontSize: 13, color: C.muted, textAlign: 'center', paddingHorizontal: 40 },
});
