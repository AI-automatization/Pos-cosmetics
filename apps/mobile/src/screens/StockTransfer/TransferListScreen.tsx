// StockTransfer/TransferListScreen.tsx — barcha transferlar ro'yxati (status filter + action buttons)
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, type StockTransferListItem, type TransferStatus } from '../../api/inventory.api';
import { C } from './StockTransferColors';

// ── Constants ────────────────────────────────────────────────────────────────
type StatusFilter = TransferStatus | 'ALL';
type ActionType = 'approve' | 'ship' | 'receive' | 'cancel';
const MAX_VISIBLE_ITEMS = 3;

const FILTER_TABS: readonly { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Barchasi' }, { key: 'REQUESTED', label: "So'ralgan" },
  { key: 'APPROVED', label: 'Tasdiqlangan' }, { key: 'SHIPPED', label: "Jo'natilgan" },
  { key: 'RECEIVED', label: 'Qabul qilingan' }, { key: 'CANCELLED', label: 'Bekor qilingan' },
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
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── ActionButton helper ──────────────────────────────────────────────────────
interface ActionBtnConfig { label: string; color: string; action: ActionType }

function getActionButtons(status: TransferStatus): ActionBtnConfig[] {
  switch (status) {
    case 'REQUESTED': return [
      { label: 'Tasdiqlash', color: C.green, action: 'approve' },
      { label: 'Bekor qilish', color: C.red, action: 'cancel' },
    ];
    case 'APPROVED': return [
      { label: "Jo'natish", color: C.blue, action: 'ship' },
      { label: 'Bekor qilish', color: C.red, action: 'cancel' },
    ];
    case 'SHIPPED': return [
      { label: 'Qabul qilish', color: C.green, action: 'receive' },
    ];
    default: return [];
  }
}

// ── TransferCard ─────────────────────────────────────────────────────────────
interface TransferCardProps {
  readonly item: StockTransferListItem;
  readonly onAction: (id: string, action: ActionType) => void;
  readonly isActing: boolean;
}

const TransferCard = React.memo(function TransferCard({ item, onAction, isActing }: TransferCardProps) {
  const cfg = STATUS_CFG[item.status] ?? STATUS_CFG.REQUESTED;
  const visibleItems = item.items.slice(0, MAX_VISIBLE_ITEMS);
  const remaining = item.items.length - MAX_VISIBLE_ITEMS;
  const buttons = getActionButtons(item.status);

  const handlePress = useCallback((action: ActionType) => {
    if (action === 'cancel') {
      Alert.alert('Bekor qilish', 'Transferni bekor qilmoqchimisiz?', [
        { text: "Yo'q", style: 'cancel' },
        { text: 'Ha, bekor qilish', style: 'destructive', onPress: () => onAction(item.id, 'cancel') },
      ]);
    } else {
      onAction(item.id, action);
    }
  }, [item.id, onAction]);

  return (
    <View style={s.card}>
      {/* Branch flow + status */}
      <View style={s.cardRow}>
        <View style={s.branchFlow}>
          <Text style={s.branchName} numberOfLines={1}>{item.fromBranch.name}</Text>
          <Ionicons name="arrow-forward" size={14} color={C.muted} />
          <Text style={s.branchName} numberOfLines={1}>{item.toBranch.name}</Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
      {/* Date + requester */}
      <View style={s.metaRow}>
        <Ionicons name="calendar-outline" size={12} color={C.muted} />
        <Text style={s.metaText}>{formatDate(item.createdAt)}</Text>
        <Ionicons name="person-outline" size={12} color={C.muted} style={s.metaIcon} />
        <Text style={s.metaText}>{item.requestedBy.firstName} {item.requestedBy.lastName}</Text>
      </View>
      {/* Items */}
      <View style={s.itemsList}>
        {visibleItems.map((ti) => (
          <View key={ti.id} style={s.itemRow}>
            <View style={s.itemDot} />
            <Text style={s.itemText} numberOfLines={1}>{ti.product.name}</Text>
            <Text style={s.itemQty}>{ti.quantity} dona</Text>
          </View>
        ))}
        {remaining > 0 && <Text style={s.moreItems}>+{remaining} ta boshqa</Text>}
      </View>
      {/* Notes */}
      {item.notes ? (
        <View style={s.notesRow}>
          <Ionicons name="document-text-outline" size={12} color={C.muted} />
          <Text style={s.notesText} numberOfLines={2}>{item.notes}</Text>
        </View>
      ) : null}
      {/* Actions */}
      {buttons.length > 0 && (
        <View style={s.actionsRow}>
          {buttons.map((btn) => (
            <TouchableOpacity
              key={btn.action}
              style={[s.actionBtn, { backgroundColor: btn.color }]}
              onPress={() => handlePress(btn.action)}
              disabled={isActing}
              activeOpacity={0.75}
            >
              {isActing && btn.action !== 'cancel' ? (
                <ActivityIndicator size="small" color={C.white} />
              ) : (
                <Text style={s.actionBtnText}>{btn.label}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
});

// ── Screen ───────────────────────────────────────────────────────────────────
export default function TransferListScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [actingId, setActingId] = useState<string | null>(null);

  const transfers = useQuery({
    queryKey: ['transfers', statusFilter],
    queryFn: () => inventoryApi.listTransfers(
      statusFilter === 'ALL' ? { limit: 50 } : { status: statusFilter, limit: 50 },
    ),
    staleTime: 30_000,
  });

  const items = transfers.data?.items ?? [];
  const total = transfers.data?.total ?? 0;

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: ActionType }) => {
      const map: Record<ActionType, (tid: string) => Promise<void>> = {
        approve: inventoryApi.approveTransfer, ship: inventoryApi.shipTransfer,
        receive: inventoryApi.receiveTransfer, cancel: inventoryApi.cancelTransfer,
      };
      return map[action](id);
    },
    onMutate: ({ id }) => setActingId(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transfers'] }),
    onError: () => Alert.alert('Xatolik', "Amalni bajarib bo'lmadi. Qayta urinib ko'ring."),
    onSettled: () => setActingId(null),
  });

  const handleAction = useCallback(
    (id: string, action: ActionType) => actionMutation.mutate({ id, action }),
    [actionMutation],
  );

  const renderItem = useCallback(
    ({ item }: { item: StockTransferListItem }) => (
      <TransferCard item={item} onAction={handleAction} isActing={actingId === item.id} />
    ),
    [handleAction, actingId],
  );

  const keyExtractor = useCallback((item: StockTransferListItem) => item.id, []);

  // Error state
  if (transfers.isError) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Transferlar</Text>
          <View style={s.headerRight} />
        </View>
        <View style={s.centerFill}>
          <Ionicons name="alert-circle-outline" size={48} color={C.muted} />
          <Text style={s.errorText}>Ma'lumot yuklanmadi</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => transfers.refetch()} activeOpacity={0.75}>
            <Text style={s.retryBtnText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Transferlar</Text>
          {!transfers.isLoading && <Text style={s.headerSub}>{total} ta</Text>}
        </View>
        <View style={s.headerRight} />
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
        {FILTER_TABS.map((tab) => {
          const active = statusFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[s.filterTab, active && s.filterTabActive]}
              onPress={() => setStatusFilter(tab.key)}
              activeOpacity={0.75}
            >
              <Text style={[s.filterTabText, active && s.filterTabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={transfers.isRefetching}
        onRefresh={() => transfers.refetch()}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          transfers.isLoading ? (
            <View style={s.centerFill}><ActivityIndicator size="large" color={C.primary} /></View>
          ) : (
            <View style={s.emptyState}>
              <Ionicons name="swap-horizontal-outline" size={48} color={C.muted} />
              <Text style={s.emptyText}>
                {statusFilter !== 'ALL' ? 'Bu statusda transfer topilmadi' : "Transferlar yo'q"}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  android: { elevation: 2 },
}) ?? {};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  headerRight: { width: 36 },
  // Filter
  filterRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6' },
  filterTabActive: { backgroundColor: C.primary },
  filterTabText: { fontSize: 12, fontWeight: '600', color: C.muted },
  filterTabTextActive: { color: C.white },
  // List
  listContent: { paddingVertical: 16 },
  // Card
  card: { backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, marginHorizontal: 16, marginBottom: 10, gap: 10, ...shadow, overflow: Platform.OS === 'android' ? 'hidden' as const : 'visible' as const },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  branchFlow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 8 },
  branchName: { fontSize: 14, fontWeight: '600', color: C.text, flexShrink: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  // Meta
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { marginLeft: 12 },
  metaText: { fontSize: 12, color: C.muted },
  // Items
  itemsList: { gap: 4 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.muted },
  itemText: { flex: 1, fontSize: 13, color: C.secondary },
  itemQty: { fontSize: 13, fontWeight: '600', color: C.text },
  moreItems: { fontSize: 12, color: C.primary, fontWeight: '600', marginLeft: 10 },
  // Notes
  notesRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, paddingTop: 2 },
  notesText: { flex: 1, fontSize: 12, color: C.muted, fontStyle: 'italic' },
  // Actions
  actionsRow: { flexDirection: 'row', gap: 8, paddingTop: 4 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 40 },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: C.white },
  // States
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 80 },
  errorText: { fontSize: 15, color: C.muted },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, backgroundColor: C.primary, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
  emptyState: { paddingTop: 60, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: C.muted },
});
