import React, { useState, useMemo, useRef } from 'react';
import NewReceiptSheet from './NewReceiptSheet';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { Receipt } from '../../api/inventory.api';
import { useKirimData } from './useKirimData';
import { formatUZS, formatCompact } from '../../utils/currency';
import ShiftGuard from '../../components/common/ShiftGuard';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:       '#F5F5F7',
  white:    '#FFFFFF',
  text:     '#111827',
  muted:    '#9CA3AF',
  secondary:'#6B7280',
  border:   '#F3F4F6',
  primary:  '#5B5BD6',
  green:    '#10B981',
  orange:   '#F59E0B',
  blue:     '#3B82F6',
  red:      '#EF4444',
};

// ─── Types ─────────────────────────────────────────────
type ReceiptStatus = Receipt['status'];
type FilterTab = 'ALL' | 'PENDING' | 'RECEIVED';

// ─── Status config ─────────────────────────────────────
const STATUS_CFG: Record<ReceiptStatus, { bg: string; text: string; label: string; icon: string }> = {
  PENDING:   { bg: '#FEF3C7', text: C.orange, label: 'Kutilmoqda',     icon: 'clock-outline'       },
  RECEIVED:  { bg: '#D1FAE5', text: C.green,  label: 'Qabul qilingan', icon: 'check-circle-outline' },
  CANCELLED: { bg: '#F3F4F6', text: C.muted,  label: 'Bekor qilingan', icon: 'close-circle-outline' },
};

// ─── Tabs ──────────────────────────────────────────────
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL',      label: 'Hammasi'        },
  { key: 'PENDING',  label: 'Kutilmoqda'     },
  { key: 'RECEIVED', label: 'Qabul qilingan' },
];

// ─── Stats chips ───────────────────────────────────────
const StatsChips = React.memo(function StatsChips({ receipts }: { receipts: Receipt[] }) {
  const total    = receipts.length;
  const pending  = receipts.filter((r) => r.status === 'PENDING').length;
  const received = receipts.filter((r) => r.status === 'RECEIVED').length;
  const totalAmt = receipts.reduce((s, r) => s + r.totalCost, 0);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
    >
      <View style={[styles.chip, { backgroundColor: C.primary + '15' }]}>
        <Text style={[styles.chipValue, { color: C.primary }]}>{total}</Text>
        <Text style={[styles.chipLabel, { color: C.primary }]}>Jami</Text>
      </View>
      <View style={[styles.chip, { backgroundColor: '#FEF3C7' }]}>
        <Text style={[styles.chipValue, { color: C.orange }]}>{pending}</Text>
        <Text style={[styles.chipLabel, { color: C.orange }]}>Kutilmoqda</Text>
      </View>
      <View style={[styles.chip, { backgroundColor: '#D1FAE5' }]}>
        <Text style={[styles.chipValue, { color: C.green }]}>{received}</Text>
        <Text style={[styles.chipLabel, { color: C.green }]}>Qabul qilingan</Text>
      </View>
      <View style={[styles.chip, { backgroundColor: '#EFF6FF' }]}>
        <Text style={[styles.chipValue, { color: C.blue }]}>{formatCompact(totalAmt)}</Text>
        <Text style={[styles.chipLabel, { color: C.blue }]}>Jami summa</Text>
      </View>
    </ScrollView>
  );
});

// ─── Receipt card ──────────────────────────────────────
function ReceiptCard({ receipt, onPress }: { receipt: Receipt; onPress: () => void }) {
  const cfg = STATUS_CFG[receipt.status];
  return (
    <TouchableOpacity style={styles.receiptCard} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.receiptHeader}>
        <View style={styles.receiptLeft}>
          <View style={styles.receiptIconWrap}>
            <MaterialCommunityIcons name="package-variant" size={20} color={C.primary} />
          </View>
          <View>
            <Text style={styles.receiptNumber}>{receipt.receiptNumber}</Text>
            <Text style={styles.receiptSupplier}>{receipt.supplierName}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={styles.receiptFooter}>
        <View style={styles.receiptMeta}>
          <Ionicons name="calendar-outline" size={13} color={C.muted} />
          <Text style={styles.receiptDate}>{receipt.date}</Text>
          <Text style={styles.receiptDot}>·</Text>
          <Text style={styles.receiptItems}>{receipt.itemsCount} ta mahsulot</Text>
        </View>
        <Text style={styles.receiptAmount}>{formatUZS(receipt.totalCost)}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Detail bottom sheet ───────────────────────────────
function DetailSheet({
  visible,
  receipt,
  onClose,
  onApprove,
  onReject,
  approving,
  rejecting,
}: {
  visible: boolean;
  receipt: Receipt | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  approving: boolean;
  rejecting: boolean;
}) {
  if (!receipt) return null;
  const cfg = STATUS_CFG[receipt.status];
  const items = receipt.items ?? [];
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const isPending = receipt.status === 'PENDING';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />

        {/* Sheet header */}
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetNumber}>{receipt.receiptNumber}</Text>
            <Text style={styles.sheetSupplier}>{receipt.supplierName}</Text>
          </View>
          <TouchableOpacity style={styles.sheetCloseBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color={C.secondary} />
          </TouchableOpacity>
        </View>

        {/* Meta row */}
        <View style={styles.sheetMeta}>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.text }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.sheetDate}>
            <Ionicons name="calendar-outline" size={12} color={C.muted} /> {receipt.date}
          </Text>
        </View>

        {receipt.notes ? (
          <View style={styles.notesRow}>
            <Ionicons name="information-circle-outline" size={14} color={C.orange} />
            <Text style={styles.notesText}>{receipt.notes}</Text>
          </View>
        ) : null}

        {/* Items */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.itemsScroll}>
          <Text style={styles.itemsTitle}>Mahsulotlar ({items.length} ta)</Text>
          {items.map((item, idx) => (
            <View key={`${item.productId}-${idx}`} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemIdx}>{idx + 1}</Text>
                <View style={styles.itemNameWrap}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                  <Text style={styles.itemCost}>{formatUZS(item.costPrice)} / dona</Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemQty}>{item.qty} {item.unit}</Text>
                <Text style={styles.itemTotal}>{formatUZS(item.qty * item.costPrice)}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Footer summary */}
        <View style={styles.sheetFooter}>
          <View style={styles.sheetFooterRow}>
            <Text style={styles.sheetFooterLabel}>Jami miqdor:</Text>
            <Text style={styles.sheetFooterValue}>{totalQty} ta</Text>
          </View>
          <View style={styles.sheetFooterRow}>
            <Text style={styles.sheetFooterLabel}>Jami narx:</Text>
            <Text style={[styles.sheetFooterValue, styles.sheetFooterValueHighlight]}>
              {formatUZS(receipt.totalCost)}
            </Text>
          </View>

          {/* Approve / Reject buttons */}
          {isPending && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => onReject(receipt.id)}
                disabled={rejecting || approving}
                activeOpacity={0.8}
              >
                {rejecting ? (
                  <ActivityIndicator size="small" color={C.red} />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={18} color={C.red} />
                    <Text style={styles.rejectBtnText}>Rad etish</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => onApprove(receipt.id)}
                disabled={approving || rejecting}
                activeOpacity={0.8}
              >
                {approving ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color={C.white} />
                    <Text style={styles.approveBtnText}>Qabul qilish</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────
export default function KirimScreen() {
  const [search, setSearch]             = useState('');
  const [selected, setSelected]         = useState<Receipt | null>(null);
  const [detailVisible, setDetail]      = useState(false);
  const [activeTab, setActiveTab]       = useState<FilterTab>('ALL');
  const [newSheetVisible, setNewSheet]  = useState(false);
  const listRef                         = useRef<FlatList<Receipt>>(null);

  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const { list, detail, create, approve, reject } = useKirimData(selectedId);
  const allReceipts = list.data?.items ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allReceipts.filter((r) => {
      const matchSearch =
        r.receiptNumber.toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q);
      const matchTab = activeTab === 'ALL' || r.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [search, activeTab, allReceipts]);

  const handleApprove = (id: string) => {
    Alert.alert('Tasdiqlash', 'Ushbu kirimni qabul qilmoqchimisiz?', [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: 'Qabul qilish',
        onPress: () =>
          approve.mutate(id, {
            onSuccess: () => {
              Alert.alert('Muvaffaqiyat', 'Kirim qabul qilindi');
              setDetail(false);
            },
            onError: (err) => Alert.alert('Xatolik', err.message),
          }),
      },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert('Rad etish', 'Ushbu kirimni rad etmoqchimisiz?', [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: 'Rad etish',
        style: 'destructive',
        onPress: () =>
          reject.mutate(id, {
            onSuccess: () => {
              Alert.alert('Rad etildi', 'Kirim bekor qilindi');
              setDetail(false);
            },
            onError: (err) => Alert.alert('Xatolik', err.message),
          }),
      },
    ]);
  };

  const openDetail = (receipt: Receipt) => {
    setSelectedId(receipt.id);
    setSelected(receipt);
    setDetail(true);
  };

  if (list.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kirim</Text>
        </View>
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (list.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kirim</Text>
        </View>
        <View style={styles.centerFill}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={C.muted} />
          <Text style={styles.errorText}>Ma'lumot yuklanmadi</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => list.refetch()} activeOpacity={0.75}>
            <Text style={styles.retryBtnText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ShiftGuard>
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kirim</Text>
        <TouchableOpacity
          style={styles.headerIcon}
          activeOpacity={0.7}
          onPress={() => setNewSheet(true)}
        >
          <Ionicons name="add" size={22} color={C.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Stats */}
            <StatsChips receipts={allReceipts} />

            {/* Search */}
            <View style={styles.searchRow}>
              <Feather name="search" size={16} color={C.muted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Raqam yoki yetkazib beruvchi..."
                placeholderTextColor={C.muted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Feather name="x" size={16} color={C.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsRow}
            >
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                  onPress={() => {
                    setActiveTab(tab.key);
                    listRef.current?.scrollToOffset({ offset: 0, animated: true });
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.resultCount}>{filtered.length} ta kirim</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ReceiptCard receipt={item} onPress={() => openDetail(item)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="package-variant-closed" size={48} color={C.muted} />
            <Text style={styles.emptyText}>Kirim topilmadi</Text>
          </View>
        }
      />

      <DetailSheet
        visible={detailVisible}
        receipt={detail.data ?? selected}
        onClose={() => { setDetail(false); setSelectedId(null); }}
        onApprove={handleApprove}
        onReject={handleReject}
        approving={approve.isPending}
        rejecting={reject.isPending}
      />

      <NewReceiptSheet
        visible={newSheetVisible}
        onClose={() => setNewSheet(false)}
        onSuccess={() => setNewSheet(false)}
        createMutation={create}
      />
    </SafeAreaView>
    </ShiftGuard>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  headerIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.primary + '15', alignItems: 'center', justifyContent: 'center',
  },

  content: { paddingBottom: 32 },
  listHeader: { gap: 12, paddingBottom: 4 },

  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 15, color: C.muted },
  retryBtn: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10,
    backgroundColor: C.primary,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: C.white },

  // Chips
  chipsRow: { paddingHorizontal: 16, gap: 10, paddingVertical: 16 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, alignItems: 'center', minWidth: 80,
  },
  chipValue: { fontSize: 16, fontWeight: '800' },
  chipLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Search
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 12,
    paddingHorizontal: 14, height: 44,
    marginHorizontal: 16, borderWidth: 1, borderColor: C.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  resultCount: { fontSize: 12, color: C.muted, paddingHorizontal: 16 },

  // Tabs
  tabsRow:       { paddingHorizontal: 16, gap: 8 },
  tab:           { height: 36, paddingHorizontal: 18, borderRadius: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  tabActive:     { backgroundColor: C.primary, borderColor: C.primary },
  tabText:       { fontSize: 14, fontWeight: '600', color: C.secondary },
  tabTextActive: { color: C.white },

  // Receipt card
  receiptCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    marginHorizontal: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  receiptHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  receiptLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 },
  receiptIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.primary + '15', alignItems: 'center', justifyContent: 'center',
  },
  receiptNumber:   { fontSize: 15, fontWeight: '700', color: C.text },
  receiptSupplier: { fontSize: 12, color: C.secondary, marginTop: 2 },
  statusBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText:      { fontSize: 11, fontWeight: '700' },
  receiptFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptMeta:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  receiptDate:     { fontSize: 12, color: C.muted },
  receiptDot:      { fontSize: 12, color: C.muted },
  receiptItems:    { fontSize: 12, color: C.secondary },
  receiptAmount:   { fontSize: 14, fontWeight: '700', color: C.text },

  separator: { height: 10 },

  // Empty
  empty:     { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: C.muted },

  // Detail sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 34,
  },
  sheetHandle: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: C.border, alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  sheetNumber:   { fontSize: 18, fontWeight: '800', color: C.text },
  sheetSupplier: { fontSize: 13, color: C.secondary, marginTop: 3 },
  sheetCloseBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.border, alignItems: 'center', justifyContent: 'center',
  },
  sheetMeta: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, marginBottom: 8,
  },
  sheetDate: { fontSize: 12, color: C.muted },
  notesRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 20, marginBottom: 8,
    backgroundColor: '#FEF3C7', borderRadius: 8, padding: 10,
  },
  notesText: { fontSize: 12, color: C.orange, flex: 1 },
  itemsScroll: { maxHeight: 320, paddingHorizontal: 20 },
  itemsTitle:  { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 10 },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  itemLeft:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1, marginRight: 8 },
  itemNameWrap: { flex: 1 },
  itemIdx: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.primary + '15', textAlign: 'center',
    fontSize: 11, fontWeight: '700', color: C.primary, lineHeight: 22,
  },
  itemName:  { fontSize: 13, fontWeight: '600', color: C.text },
  itemCost:  { fontSize: 11, color: C.muted, marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemQty:   { fontSize: 13, fontWeight: '700', color: C.text },
  itemTotal: { fontSize: 12, color: C.secondary },

  // Sheet footer
  sheetFooter: {
    paddingHorizontal: 20, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: C.border,
    gap: 6,
  },
  sheetFooterRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetFooterLabel: { fontSize: 14, color: C.secondary },
  sheetFooterValue:          { fontSize: 15, fontWeight: '700', color: C.text },
  sheetFooterValueHighlight: { fontSize: 18, color: C.primary },

  // Approve / Reject
  actionRow: {
    flexDirection: 'row', gap: 10, marginTop: 14,
  },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, height: 48, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.red, backgroundColor: C.white,
  },
  rejectBtnText: { fontSize: 14, fontWeight: '700', color: C.red },
  approveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, height: 48, borderRadius: 12, backgroundColor: C.green,
  },
  approveBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
});
