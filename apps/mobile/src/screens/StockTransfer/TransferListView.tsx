import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { StyleProp, ViewStyle, ListRenderItemInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  inventoryApi,
  type StockTransferListItem,
  type TransferStatus,
} from '../../api/inventory.api';
import { useAuthStore } from '../../store/auth.store';
import { C } from './StockTransferColors';
import { s } from './TransferListView.styles';
import TransferCard from './TransferCard';
import type { ActionType } from './TransferCard';

// ─── Constants ───────────────────────────────────────────────────────────────

type StatusFilter = TransferStatus | 'ALL';

const FILTER_TABS: readonly { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Barchasi' },
  { key: 'REQUESTED', label: "So'ralgan" },
  { key: 'APPROVED', label: 'Tasdiqlangan' },
  { key: 'SHIPPED', label: "Jo'natilgan" },
  { key: 'RECEIVED', label: 'Qabul qilingan' },
  { key: 'CANCELLED', label: 'Bekor qilingan' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransferListViewProps {
  readonly style?: StyleProp<ViewStyle>;
}

// ─── TransferListView ─────────────────────────────────────────────────────────

export default function TransferListView({ style }: TransferListViewProps) {
  const queryClient = useQueryClient();
  const userRole = useAuthStore((s) => s.user?.role);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [actingId, setActingId] = useState<string | null>(null);

  const transfers = useQuery({
    queryKey: ['stock-transfers', statusFilter],
    queryFn: () =>
      inventoryApi.listTransfers(statusFilter === 'ALL' ? undefined : { status: statusFilter }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const items: StockTransferListItem[] = transfers.data?.items ?? [];

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: ActionType }) => {
      switch (action) {
        case 'approve':
          return inventoryApi.approveTransfer(id);
        case 'ship':
          return inventoryApi.shipTransfer(id);
        case 'receive':
          return inventoryApi.receiveTransfer(id);
        case 'cancel':
          return inventoryApi.cancelTransfer(id);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
    },
    onError: () => {
      Alert.alert('Xatolik', 'Amal bajarilmadi. Qayta urinib ko\'ring.');
    },
    onSettled: () => {
      setActingId(null);
    },
  });

  const handleAction = useCallback(
    (id: string, action: ActionType) => {
      const labels: Record<ActionType, string> = {
        approve: 'tasdiqlash',
        ship: "jo'natish",
        receive: 'qabul qilish',
        cancel: 'bekor qilish',
      };
      Alert.alert(
        'Tasdiqlash',
        `Transferni ${labels[action]} istaysizmi?`,
        [
          { text: 'Yo\'q', style: 'cancel' },
          {
            text: 'Ha',
            style: action === 'cancel' ? 'destructive' : 'default',
            onPress: () => {
              setActingId(id);
              actionMutation.mutate({ id, action });
            },
          },
        ],
      );
    },
    [actionMutation],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<StockTransferListItem>) => (
      <TransferCard item={item} actingId={actingId} onAction={handleAction} userRole={userRole} />
    ),
    [actingId, handleAction, userRole],
  );

  const keyExtractor = useCallback(
    (item: StockTransferListItem) => item.id,
    [],
  );

  if (transfers.isError) {
    return (
      <View style={[s.errorWrap, style]}>
        <Ionicons name="alert-circle-outline" size={48} color={C.muted} />
        <Text style={s.errorText}>Ma'lumot yuklanmadi</Text>
        <TouchableOpacity
          style={s.retryBtn}
          onPress={() => transfers.refetch()}
          activeOpacity={0.75}
        >
          <Text style={s.retryBtnText}>Qayta urinish</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.container, style]}>
      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterScroll}
        contentContainerStyle={s.filterRow}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[s.filterTab, isActive && s.filterTabActive]}
              onPress={() => setStatusFilter(tab.key)}
              activeOpacity={0.75}
            >
              <Text style={[s.filterTabText, isActive && s.filterTabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      <FlatList<StockTransferListItem>
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={transfers.isFetching && !transfers.isLoading}
        onRefresh={() => transfers.refetch()}
        ListEmptyComponent={
          transfers.isLoading ? (
            <View style={s.centerWrap}>
              <ActivityIndicator size="large" color={C.primary} />
            </View>
          ) : (
            <View style={s.centerWrap}>
              <Ionicons name="swap-horizontal-outline" size={48} color={C.muted} />
              <Text style={s.emptyText}>Transferlar topilmadi</Text>
            </View>
          )
        }
      />
    </View>
  );
}
