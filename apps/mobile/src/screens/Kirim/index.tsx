import React, { useState, useMemo, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
};

// ─── Types ─────────────────────────────────────────────
type ReceiptStatus = 'PENDING' | 'ACCEPTED' | 'CANCELLED';
type FilterTab = 'ALL' | 'PENDING' | 'ACCEPTED';

interface ReceiptItem {
  productName: string;
  qty: number;
  unit: string;
  costPrice: number;
}

interface Receipt {
  id: string;
  number: string;
  supplier: string;
  date: string;
  status: ReceiptStatus;
  totalAmount: number;
  itemsCount: number;
  items: ReceiptItem[];
  notes?: string;
}

// ─── Status config ─────────────────────────────────────
const STATUS_CFG: Record<ReceiptStatus, { bg: string; text: string; label: string; icon: string }> = {
  PENDING:   { bg: '#FEF3C7', text: C.orange, label: 'Kutilmoqda',     icon: 'clock-outline'      },
  ACCEPTED:  { bg: '#D1FAE5', text: C.green,  label: 'Qabul qilingan', icon: 'check-circle-outline'},
  CANCELLED: { bg: '#F3F4F6', text: C.muted,  label: 'Bekor qilingan', icon: 'close-circle-outline'},
};

// ─── Mock data ─────────────────────────────────────────
const MOCK_RECEIPTS: Receipt[] = [
  {
    id: '1', number: 'KR-00245', supplier: 'Loreal Distribution',
    date: '2026-03-10', status: 'ACCEPTED', totalAmount: 4_850_000, itemsCount: 6,
    items: [
      { productName: "L'Oreal Professional Shampoo 500ml", qty: 24, unit: 'dona', costPrice: 38_000 },
      { productName: 'Loreal Expert Conditioner', qty: 18, unit: 'dona', costPrice: 42_000 },
      { productName: 'Loreal Serum Vitamin C', qty: 12, unit: 'dona', costPrice: 75_000 },
      { productName: 'Loreal Hair Mask', qty: 10, unit: 'dona', costPrice: 95_000 },
      { productName: 'Loreal Repair Cream', qty: 8, unit: 'dona', costPrice: 68_000 },
      { productName: 'Loreal Oil Treatment', qty: 6, unit: 'dona', costPrice: 112_000 },
    ],
  },
  {
    id: '2', number: 'KR-00244', supplier: 'Nivea Uzbekistan',
    date: '2026-03-09', status: 'PENDING', totalAmount: 2_340_000, itemsCount: 4,
    items: [
      { productName: 'Nivea Soft Cream 200ml', qty: 36, unit: 'dona', costPrice: 28_000 },
      { productName: 'Nivea Body Lotion', qty: 24, unit: 'dona', costPrice: 35_000 },
      { productName: 'Nivea Sun Protect SPF50', qty: 20, unit: 'dona', costPrice: 52_000 },
      { productName: 'Nivea Lip Care', qty: 48, unit: 'dona', costPrice: 15_000 },
    ],
    notes: 'Yetkazib berish 2 kun kechikdi',
  },
  {
    id: '3', number: 'KR-00243', supplier: 'Garnier Official',
    date: '2026-03-08', status: 'ACCEPTED', totalAmount: 1_920_000, itemsCount: 3,
    items: [
      { productName: 'Garnier Micellar Water 400ml', qty: 30, unit: 'dona', costPrice: 32_000 },
      { productName: 'Garnier BB Cream', qty: 20, unit: 'dona', costPrice: 45_000 },
      { productName: 'Garnier Sheet Mask', qty: 60, unit: 'dona', costPrice: 12_000 },
    ],
  },
  {
    id: '4', number: 'KR-00242', supplier: 'Procter & Gamble',
    date: '2026-03-07', status: 'ACCEPTED', totalAmount: 3_150_000, itemsCount: 5,
    items: [
      { productName: 'Pantene Pro-V Shampoo', qty: 30, unit: 'dona', costPrice: 36_000 },
      { productName: 'Head & Shoulders', qty: 24, unit: 'dona', costPrice: 42_000 },
      { productName: 'Olay Moisturizer', qty: 18, unit: 'dona', costPrice: 68_000 },
      { productName: 'Gillette Shave Gel', qty: 20, unit: 'dona', costPrice: 38_000 },
      { productName: 'Old Spice Deodorant', qty: 24, unit: 'dona', costPrice: 32_000 },
    ],
  },
  {
    id: '5', number: 'KR-00241', supplier: 'Chanel Boutique',
    date: '2026-03-05', status: 'CANCELLED', totalAmount: 8_400_000, itemsCount: 2,
    items: [
      { productName: 'Chanel N°5 Eau de Parfum 100ml', qty: 5, unit: 'dona', costPrice: 1_200_000 },
      { productName: 'Chanel Coco Mademoiselle 50ml', qty: 4, unit: 'dona', costPrice: 900_000 },
    ],
    notes: 'Yetkazib beruvchi tomonidan bekor qilindi',
  },
];

// ─── Tabs ──────────────────────────────────────────────
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL',      label: 'Hammasi'        },
  { key: 'PENDING',  label: 'Kutilmoqda'     },
  { key: 'ACCEPTED', label: 'Qabul qilingan' },
];

// ─── Utils ─────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString('ru-RU'); }

// ─── Stats chips ───────────────────────────────────────
function StatsChips({ receipts }: { receipts: Receipt[] }) {
  const total    = receipts.length;
  const pending  = receipts.filter((r) => r.status === 'PENDING').length;
  const accepted = receipts.filter((r) => r.status === 'ACCEPTED').length;
  const totalAmt = receipts.reduce((s, r) => s + r.totalAmount, 0);

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
        <Text style={[styles.chipValue, { color: C.green }]}>{accepted}</Text>
        <Text style={[styles.chipLabel, { color: C.green }]}>Qabul qilingan</Text>
      </View>
      <View style={[styles.chip, { backgroundColor: '#EFF6FF' }]}>
        <Text style={[styles.chipValue, { color: C.blue }]}>{fmt(totalAmt)}</Text>
        <Text style={[styles.chipLabel, { color: C.blue }]}>Jami summa</Text>
      </View>
    </ScrollView>
  );
}

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
            <Text style={styles.receiptNumber}>{receipt.number}</Text>
            <Text style={styles.receiptSupplier}>{receipt.supplier}</Text>
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
        <Text style={styles.receiptAmount}>{fmt(receipt.totalAmount)} UZS</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Detail bottom sheet ───────────────────────────────
function DetailSheet({
  visible,
  receipt,
  onClose,
}: {
  visible: boolean;
  receipt: Receipt | null;
  onClose: () => void;
}) {
  if (!receipt) return null;
  const cfg = STATUS_CFG[receipt.status];
  const totalQty = receipt.items.reduce((s, i) => s + i.qty, 0);

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
            <Text style={styles.sheetNumber}>{receipt.number}</Text>
            <Text style={styles.sheetSupplier}>{receipt.supplier}</Text>
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

        {receipt.notes && (
          <View style={styles.notesRow}>
            <Ionicons name="information-circle-outline" size={14} color={C.orange} />
            <Text style={styles.notesText}>{receipt.notes}</Text>
          </View>
        )}

        {/* Items */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.itemsScroll}>
          <Text style={styles.itemsTitle}>Mahsulotlar ({receipt.items.length} ta)</Text>
          {receipt.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemIdx}>{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                  <Text style={styles.itemCost}>{fmt(item.costPrice)} UZS / dona</Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemQty}>{item.qty} {item.unit}</Text>
                <Text style={styles.itemTotal}>{fmt(item.qty * item.costPrice)}</Text>
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
            <Text style={[styles.sheetFooterValue, { color: C.primary, fontSize: 18 }]}>
              {fmt(receipt.totalAmount)} UZS
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ───────────────────────────────────────
export default function KirimScreen() {
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState<Receipt | null>(null);
  const [detailVisible, setDetail]    = useState(false);
  const [activeTab, setActiveTab]     = useState<FilterTab>('ALL');
  const listRef                       = useRef<FlatList<Receipt>>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_RECEIPTS.filter((r) => {
      const matchSearch = r.number.toLowerCase().includes(q) || r.supplier.toLowerCase().includes(q);
      const matchTab    = activeTab === 'ALL' || r.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [search, activeTab]);

  const openDetail = (receipt: Receipt) => {
    setSelected(receipt);
    setDetail(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kirim</Text>
        <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
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
            <StatsChips receipts={MOCK_RECEIPTS} />

            {/* Search */}
            <View style={styles.searchRow}>
              <Feather name="search" size={16} color={C.muted} style={{ marginRight: 8 }} />
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
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="package-variant-closed" size={48} color={C.muted} />
            <Text style={styles.emptyText}>Kirim topilmadi</Text>
          </View>
        }
      />

      <DetailSheet
        visible={detailVisible}
        receipt={selected}
        onClose={() => setDetail(false)}
      />
    </SafeAreaView>
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
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  resultCount: { fontSize: 12, color: C.muted, paddingHorizontal: 16 },

  // Tabs
  tabsRow:      { paddingHorizontal: 16, gap: 8 },
  tab:          { height: 36, paddingHorizontal: 18, borderRadius: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  tabActive:    { backgroundColor: C.primary, borderColor: C.primary },
  tabText:      { fontSize: 14, fontWeight: '600', color: C.secondary },
  tabTextActive:{ color: C.white },

  // Receipt card
  receiptCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    marginHorizontal: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  receiptLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 },
  receiptIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: C.primary + '15', alignItems: 'center', justifyContent: 'center',
  },
  receiptNumber: { fontSize: 15, fontWeight: '700', color: C.text },
  receiptSupplier: { fontSize: 12, color: C.secondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  receiptFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  receiptDate: { fontSize: 12, color: C.muted },
  receiptDot: { fontSize: 12, color: C.muted },
  receiptItems: { fontSize: 12, color: C.secondary },
  receiptAmount: { fontSize: 14, fontWeight: '700', color: C.text },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
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
  sheetNumber: { fontSize: 18, fontWeight: '800', color: C.text },
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
  itemsTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 10 },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1, marginRight: 8 },
  itemIdx: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.primary + '15', textAlign: 'center',
    fontSize: 11, fontWeight: '700', color: C.primary, lineHeight: 22,
  },
  itemName: { fontSize: 13, fontWeight: '600', color: C.text },
  itemCost: { fontSize: 11, color: C.muted, marginTop: 2 },
  itemRight: { alignItems: 'flex-end', gap: 4 },
  itemQty: { fontSize: 13, fontWeight: '700', color: C.text },
  itemTotal: { fontSize: 12, color: C.secondary },

  // Sheet footer
  sheetFooter: {
    paddingHorizontal: 20, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: C.border,
    gap: 6,
  },
  sheetFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetFooterLabel: { fontSize: 14, color: C.secondary },
  sheetFooterValue: { fontSize: 15, fontWeight: '700', color: C.text },
});
