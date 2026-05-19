import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
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
import { C } from './StockTransferColors';

// ─── Constants ───────────────────────────────────────────────────────────────

type StatusFilter = TransferStatus | 'ALL';
type ActionType = 'approve' | 'ship' | 'receive' | 'cancel';

const MAX_VISIBLE_ITEMS = 3;

const FILTER_TABS: readonly { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Barchasi' },
  { key: 'REQUESTED', label: "So'ralgan" },
  { key: 'APPROVED', label: 'Tasdiqlangan' },
  { key: 'SHIPPED', label: "Jo'natilgan" },
  { key: 'RECEIVED', label: 'Qabul qilingan' },
  { key: 'CANCELLED', label: 'Bekor qilingan' },
];

const STATUS_CFG: Record<TransferStatus, { bg: string; color: string; label: string }> = {
  REQUESTED: { bg: '#FEF3C7', color: '#92400E', label: "So'ralgan" },
  APPROVED:  { bg: '#DBEAFE', color: '#1E40AF', label: 'Tasdiqlangan' },
  SHIPPED:   { bg: '#EDE9FE', color: '#5B21B6', label: "Jo'natilgan" },
  RECEIVED:  { bg: '#DCFCE7', color: '#166534', label: 'Qabul qilingan' },
  CANCELLED: { bg: '#F3F4F6', color: '#6B7280', label: 'Bekor qilingan' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

interface ActionBtnConfig {
  label: string;
  color: string;
  action: ActionType;
}

function getActionButtons(status: TransferStatus): ActionBtnConfig[] {
  switch (status) {
    case 'REQUESTED':
      return [
        { label: 'Tasdiqlash', color: C.primary, action: 'approve' },
        { label: 'Bekor qilish', color: C.red, action: 'cancel' },
      ];
    case 'APPROVED':
      return [
        { label: "Jo'natish", color: C.primary, action: 'ship' },
        { label: 'Bekor qilish', color: C.red, action: 'cancel' },
      ];
    case 'SHIPPED':
      return [{ label: 'Qabul qilish', color: C.green, action: 'receive' }];
    default:
      return [];
  }
}

// ─── TransferCard ─────────────────────────────────────────────────────────────

interface TransferCardProps {
  readonly item: StockTransferListItem;
  readonly actingId: string | null;
  readonly onAction: (id: string, action: ActionType) => void;
}

const TransferCard = React.memo(function TransferCard({
  item,
  actingId,
  onAction,
}: TransferCardProps) {
  const cfg = STATUS_CFG[item.status];
  const buttons = getActionButtons(item.status);
  const isActing = actingId === item.id;
  const visibleItems = item.items.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = item.items.length - MAX_VISIBLE_ITEMS;

  return (
    <View style={s.card}>
      {/* Card header */}
      <View style={s.cardHeader}>
        <View style={s.cardIdWrap}>
          <Ionicons name="swap-horizontal-outline" size={14} color={C.muted} />
          <Text style={s.cardId} numberOfLines={1}>
            #{item.id.slice(-8).toUpperCase()}
          </Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Branches */}
      <View style={s.branchRow}>
        <View style={s.branchBox}>
          <Text style={s.branchLabel}>Dan</Text>
          <Text style={s.branchName} numberOfLines={1}>
            {item.fromBranch.name}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={C.muted} style={s.arrowIcon} />
        <View style={[s.branchBox, s.branchBoxRight]}>
          <Text style={s.branchLabel}>Ga</Text>
          <Text style={s.branchName} numberOfLines={1}>
            {item.toBranch.name}
          </Text>
        </View>
      </View>

      {/* Items preview */}
      <View style={s.itemsWrap}>
        {visibleItems.map((it, idx) => (
          <View key={idx} style={s.itemRow}>
            <Text style={s.itemName} numberOfLines={1}>
              {it.product.name}
            </Text>
            <Text style={s.itemQty}>
              {it.quantity} dona
            </Text>
          </View>
        ))}
        {hiddenCount > 0 && (
          <Text style={s.moreItems}>+{hiddenCount} ta mahsulot</Text>
        )}
      </View>

      {/* Footer */}
      <View style={s.cardFooter}>
        <View style={s.footerLeft}>
          <Ionicons name="person-outline" size={12} color={C.muted} />
          <Text style={s.footerMeta} numberOfLines={1}>
            {item.requestedBy.firstName} {item.requestedBy.lastName}
          </Text>
          <Text style={s.footerDot}> · </Text>
          <Ionicons name="calendar-outline" size={12} color={C.muted} />
          <Text style={s.footerMeta}>{formatDate(item.createdAt)}</Text>
        </View>

        {buttons.length > 0 && (
          <View style={s.actionRow}>
            {isActing ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              buttons.map((btn) => (
                <TouchableOpacity
                  key={btn.action}
                  style={[s.actionBtn, { borderColor: btn.color }]}
                  onPress={() => onAction(item.id, btn.action)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.actionBtnText, { color: btn.color }]}>
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    </View>
  );
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransferListViewProps {
  readonly style?: StyleProp<ViewStyle>;
}

// ─── TransferListView ─────────────────────────────────────────────────────────

export default function TransferListView({ style }: TransferListViewProps) {
  const queryClient = useQueryClient();
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
      <TransferCard item={item} actingId={actingId} onAction={handleAction} />
    ),
    [actingId, handleAction],
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: C.muted,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: C.primary,
    borderRadius: 8,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Filter
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterTabActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.muted,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardIdWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardId: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  branchBox: {
    flex: 1,
  },
  branchBoxRight: {
    alignItems: 'flex-end',
  },
  branchLabel: {
    fontSize: 11,
    color: C.muted,
    marginBottom: 2,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  itemsWrap: {
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 13,
    color: C.text,
    flex: 1,
    marginRight: 8,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },
  moreItems: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  footerMeta: {
    fontSize: 12,
    color: C.muted,
  },
  footerDot: {
    fontSize: 12,
    color: C.muted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
