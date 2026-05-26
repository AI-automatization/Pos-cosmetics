import { StyleSheet, Dimensions } from 'react-native';

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
};

// Rank badge colors
export const RANK_COLORS = [
  { bg: '#FEF3C7', color: '#D97706' }, // #1 gold
  { bg: '#F1F5F9', color: '#64748B' }, // #2 silver
  { bg: '#FEF3C7', color: '#B45309' }, // #3 bronze
];

// Bar chart dimensions
export const SCREEN_W = Dimensions.get('window').width;
export const BAR_MAX_W = SCREEN_W - 32 - 120; // padding + label area

// ─── Styles ────────────────────────────────────────────
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
    gap: 10,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },

  controlsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
    paddingRight: 12,
  },
  pillsRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  toggleWrap: {
    flexDirection: 'row', gap: 4,
    backgroundColor: C.bg, borderRadius: 10,
    padding: 3, marginLeft: 4,
  },
  toggleBtn: {
    width: 34, height: 34, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleBtnActive: { backgroundColor: C.primary },

  loader: { marginTop: 40 },

  summaryRow: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  summaryValue: { fontSize: 14, fontWeight: '800', color: C.text, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  // List view
  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 8 },
  listItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 12, gap: 10,
  },
  rankCircle: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '800' },
  avatar: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '800', color: C.primary },
  itemBody: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: C.text },
  itemQty: { fontSize: 12, color: C.muted, marginTop: 2 },
  itemRevenue: { fontSize: 14, fontWeight: '800', color: C.primary },

  // Chart view
  chartContent: { padding: 16, paddingBottom: 40, gap: 8 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1,
  },
  chartCard: {
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  hChartWrap: { gap: 14 },
  hBarRow: { gap: 6 },
  hBarLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hRankDot: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  hRankText: { fontSize: 10, fontWeight: '800' },
  hBarName: { flex: 1, fontSize: 13, color: C.text, fontWeight: '600' },
  hBarTrack: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 28 },
  hBar: { height: 10, borderRadius: 5, backgroundColor: C.primary },
  hBarValue: { fontSize: 12, color: C.muted, fontWeight: '600' },

  rowDivider: { height: 1, backgroundColor: C.border, marginVertical: 2 },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10,
  },
  qtyRank: {
    width: 22, fontSize: 13, fontWeight: '800',
    color: C.muted, textAlign: 'center',
  },
  qtyName: { flex: 1, fontSize: 14, color: C.text, fontWeight: '600' },
  qtyVal: { fontSize: 13, color: C.green, fontWeight: '700' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },

  spacer: { width: 36 },
});
