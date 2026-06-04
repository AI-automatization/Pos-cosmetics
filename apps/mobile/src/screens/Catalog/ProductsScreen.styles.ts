import { StyleSheet, Platform } from 'react-native';

// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
  orange:  '#D97706',
  red:     '#DC2626',
};

// ─── Stock badge color map ─────────────────────────────
export type StockStatus = 'OK' | 'KAM' | 'TUGAGAN';

export const STOCK_STYLE: Record<StockStatus, { bg: string; text: string }> = {
  OK:      { bg: '#D1FAE5', text: '#16A34A' },
  KAM:     { bg: '#FEF3C7', text: '#D97706' },
  TUGAGAN: { bg: '#FEE2E2', text: '#DC2626' },
};

// ─── Styles ────────────────────────────────────────────
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerCount: { fontSize: 12, color: C.muted, marginTop: 2 },
  searchWrap: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  catScroll: { flexGrow: 0, backgroundColor: C.white },
  catRow: {
    paddingHorizontal: 16, paddingVertical: 8, gap: 8,
  },
  catPill: {
    height: 30, paddingHorizontal: 14, borderRadius: 15,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  catPillActive: { backgroundColor: '#2563EB' },
  catText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  catTextActive: { color: '#FFFFFF' },
  statsRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  statChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, borderRadius: 10,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
  },
  statChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  statChipLabel: { fontSize: 12, fontWeight: '600', color: C.muted },
  statChipLabelActive: { color: '#2563EB' },
  statChipCount: { fontSize: 14, fontWeight: '800', color: C.text },
  statChipCountActive: { color: '#2563EB' },
  loader: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 100 },
  separator: { height: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 12, gap: 12,
  },
  imgBox: {
    width: 60, height: 60, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  imgBoxBlue: { backgroundColor: '#EFF6FF' },
  imgInitials: {
    fontSize: 20, fontWeight: '800', color: '#2563EB',
    opacity: 0.5,
  },
  cardInfo: { flex: 1, gap: 3 },
  productName: { fontSize: 15, fontWeight: '600', color: C.text },
  productSku: {
    fontSize: 12, color: C.muted,
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
  },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  productPrice: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  stockText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  marginBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20,
    backgroundColor: '#F0FDF4',
  },
  marginText: { fontSize: 10, fontWeight: '700', color: '#16A34A' },
  menuBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
});
