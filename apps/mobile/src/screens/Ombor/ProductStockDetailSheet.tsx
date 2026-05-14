import React from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity,
  TouchableWithoutFeedback, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { LowStockItem, ProductStockLevel } from '../../api/inventory.api';
import { C } from './OmborColors';
import { getStatus, STATUS_CFG } from './OmborTypes';

// ─── Movement type config ──────────────────────────────
interface MoveTypeCfg {
  readonly color: string;
  readonly label: string;
  readonly sign: '+' | '-';
}

const MOVE_TYPE: Record<string, MoveTypeCfg> = {
  IN:           { color: '#16A34A', label: 'Kirim',      sign: '+' },
  OUT:          { color: '#DC2626', label: 'Chiqim',     sign: '-' },
  WRITE_OFF:    { color: '#D97706', label: 'Spisanie',   sign: '-' },
  TRANSFER_IN:  { color: '#2563EB', label: 'Transfer +', sign: '+' },
  TRANSFER_OUT: { color: '#7C3AED', label: 'Transfer -', sign: '-' },
  ADJUSTMENT:   { color: '#6B7280', label: 'Tuzatish',   sign: '+' },
  TESTER:       { color: '#D97706', label: 'Tester',     sign: '-' },
  RETURN_IN:    { color: '#16A34A', label: 'Qaytarish',  sign: '+' },
};
const DEFAULT_MOVE: MoveTypeCfg = { color: '#6B7280', label: 'Boshqa', sign: '+' };

// ─── Helpers ───────────────────────────────────────────
function fmtDate(d: string): string {
  const dt = new Date(d);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(dt.getDate())}.${p(dt.getMonth() + 1)}.${dt.getFullYear()} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
}

function fmtExpiry(d: string): string {
  const dt = new Date(d);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(dt.getDate())}.${p(dt.getMonth() + 1)}.${dt.getFullYear()}`;
}

function parseNote(note: string | null, type: string): string | null {
  if (!note) return null;
  if (type === 'IN' && note.includes('|')) {
    const parts = note.split('|');
    return parts.length > 1 ? parts[1].trim() : note;
  }
  return note;
}

// ─── Props & types ────────────────────────────────────
interface Props {
  readonly productId: string | null;
  readonly item: LowStockItem | null;
  readonly onClose: () => void;
}

interface MovementItem {
  readonly id: string;
  readonly type: string;
  readonly quantity: number;
  readonly note: string | null;
  readonly createdAt: string;
}

// ─── Sub-components ───────────────────────────────────
function WarehouseRow({ wh, isLast }: { readonly wh: ProductStockLevel; readonly isLast: boolean }) {
  return (
    <View style={[styles.whRow, !isLast && styles.rowBorder]}>
      <View style={styles.whLeft}>
        <Text style={styles.whName}>{wh.warehouseName}</Text>
        {wh.nearestExpiry !== null && (
          <Text style={styles.whExpiry}>Muddat: {fmtExpiry(wh.nearestExpiry)}</Text>
        )}
      </View>
      <Text style={styles.whStock}>{wh.stock} dona</Text>
    </View>
  );
}

function MovementRow({ mv, isLast }: { readonly mv: MovementItem; readonly isLast: boolean }) {
  const cfg = MOVE_TYPE[mv.type] ?? DEFAULT_MOVE;
  const note = parseNote(mv.note, mv.type);
  return (
    <View style={[styles.mvRow, !isLast && styles.rowBorder]}>
      <View style={styles.mvTop}>
        <View style={[styles.pill, { backgroundColor: cfg.color + '18' }]}>
          <View style={[styles.dot, { backgroundColor: cfg.color }]} />
          <Text style={[styles.pillLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={[styles.mvQty, { color: cfg.color }]}>{cfg.sign}{mv.quantity}</Text>
        <Text style={styles.mvDate}>{fmtDate(mv.createdAt)}</Text>
      </View>
      {note !== null && <Text style={styles.mvNote} numberOfLines={2}>{note}</Text>}
    </View>
  );
}

// ─── Main Component ──────────────────────────────────
export default function ProductStockDetailSheet({ productId, item, onClose }: Props) {
  const visible = productId !== null;

  const stockQ = useQuery({
    queryKey: ['product-stock', productId],
    queryFn: () => inventoryApi.getProductStock(productId!),
    enabled: visible,
    staleTime: 30_000,
  });

  const movQ = useQuery({
    queryKey: ['product-movements', productId],
    queryFn: () => inventoryApi.getStockMovements({ productId: productId!, limit: 20 }),
    enabled: visible,
    staleTime: 30_000,
  });

  const status = item ? getStatus(item) : 'MAVJUD';
  const sCfg = STATUS_CFG[status];
  const mvItems = movQ.data?.items ?? [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose} accessible={false}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.dragHandle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title} numberOfLines={2}>{item?.productName ?? 'Mahsulot'}</Text>
            {item?.sku !== undefined && item.sku !== '' && (
              <Text style={styles.subtitle}>SKU: {item.sku}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={20} color={C.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Section 1: Product Info */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Joriy zaxira:</Text>
              <Text style={[styles.valueBold, { color: sCfg.stockColor }]}>
                {item?.stock ?? 0} dona
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Minimum zaxira:</Text>
              <Text style={styles.value}>{item?.minStockLevel ?? 0} dona</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Holat:</Text>
              <View style={[styles.badge, { backgroundColor: sCfg.badgeBg }]}>
                <Text style={[styles.badgeText, { color: sCfg.badgeText }]}>{sCfg.label}</Text>
              </View>
            </View>
          </View>

          {/* Section 2: Stock by Warehouse */}
          <Text style={styles.secTitle}>Omborlar bo'yicha</Text>
          <View style={styles.card}>
            {stockQ.isLoading && <ActivityIndicator size="small" color={C.primary} style={styles.loader} />}
            {!stockQ.isLoading && (stockQ.data?.length ?? 0) === 0 && (
              <Text style={styles.empty}>Ma'lumot yo'q</Text>
            )}
            {!stockQ.isLoading && stockQ.data?.map((wh, i) => (
              <WarehouseRow key={wh.warehouseId} wh={wh} isLast={i === (stockQ.data?.length ?? 0) - 1} />
            ))}
          </View>

          {/* Section 3: Movement History */}
          <Text style={styles.secTitle}>
            Oxirgi harakatlar{mvItems.length > 0 ? ` (${mvItems.length})` : ''}
          </Text>
          <View style={styles.card}>
            {movQ.isLoading && <ActivityIndicator size="small" color={C.primary} style={styles.loader} />}
            {!movQ.isLoading && mvItems.length === 0 && (
              <Text style={styles.empty}>Harakatlar tarixi yo'q</Text>
            )}
            {!movQ.isLoading && mvItems.map((mv, i) => (
              <MovementRow key={mv.id} mv={mv} isLast={i === mvItems.length - 1} />
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    maxHeight: '85%', backgroundColor: C.white,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 36, elevation: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12, shadowRadius: 12,
  },
  dragHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB',
    alignSelf: 'center', marginTop: 10, marginBottom: 6,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  title: { fontSize: 16, fontWeight: '700', color: C.text },
  subtitle: { fontSize: 12, color: C.muted, marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { paddingTop: 4, paddingBottom: 16 },
  secTitle: {
    fontSize: 15, fontWeight: '700', color: C.text,
    marginTop: 16, marginBottom: 8, marginHorizontal: 16,
  },
  card: {
    backgroundColor: C.white, borderRadius: 12,
    borderWidth: 1, borderColor: C.border,
    padding: 12, marginHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 6,
  },
  label: { fontSize: 13, color: C.muted },
  value: { fontSize: 14, fontWeight: '500', color: C.text },
  valueBold: { fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  whRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 10,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  whLeft: { flex: 1 },
  whName: { fontSize: 14, fontWeight: '500', color: C.text },
  whExpiry: { fontSize: 12, color: C.orange, marginTop: 2 },
  whStock: { fontSize: 14, fontWeight: '600', color: C.text },
  mvRow: { paddingVertical: 10 },
  mvTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillLabel: { fontSize: 11, fontWeight: '600' },
  mvQty: { fontSize: 14, fontWeight: '700' },
  mvDate: { fontSize: 11, color: C.muted, marginLeft: 'auto' },
  mvNote: { fontSize: 12, color: C.muted, marginTop: 4, marginLeft: 4 },
  loader: { paddingVertical: 16 },
  empty: { fontSize: 13, color: C.muted, textAlign: 'center', paddingVertical: 12 },
});
