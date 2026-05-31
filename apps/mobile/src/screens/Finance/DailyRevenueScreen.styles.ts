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
};

// ─── Chart constants ───────────────────────────────────
export const CHART_HEIGHT = 180;
export const SCREEN_W = Dimensions.get('window').width;
export const BAR_W = 28;
export const BAR_GAP = 6;

// ─── Chart styles ──────────────────────────────────────
export const chartStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', paddingRight: 8 },
  yAxis: {
    width: 48,
    justifyContent: 'space-between',
    paddingBottom: 22,
    paddingTop: 0,
  },
  yLabel: { fontSize: 10, color: C.muted, textAlign: 'right' },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: BAR_GAP,
    paddingHorizontal: 4,
    height: CHART_HEIGHT + 22,
  },
  barCol: { alignItems: 'center', gap: 4 },
  barTrack: {
    width: BAR_W,
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: BAR_W,
    borderRadius: 6,
    backgroundColor: C.primary,
  },
  barLabel: {
    fontSize: 10,
    color: C.muted,
    width: BAR_W,
    textAlign: 'center',
  },
});

// ─── Screen styles ─────────────────────────────────────
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },

  content: { paddingBottom: 40 },
  loader: { marginTop: 40 },

  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  summaryRow: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  summaryValue: { fontSize: 16, fontWeight: '800', color: C.text, marginTop: 3 },
  summaryDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },

  chartCard: {
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    overflow: 'hidden',
  },

  tableCard: {
    marginHorizontal: 16,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  tableHead: { backgroundColor: C.bg },
  tableHeadText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  tableCell: { fontSize: 13, color: C.text },
  tableCellRevenue: { fontWeight: '700', color: C.text },
  rowDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 14 },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F0F9FF',
    borderTopWidth: 1.5,
    borderTopColor: C.primary + '40',
  },
  totalCell: { fontSize: 13, fontWeight: '800', color: C.text },

  spacer: { width: 36 },
  colName: { flex: 2 },
  colRevenue: { flex: 3, textAlign: 'right' },
  colCount: { flex: 2, textAlign: 'right' },
  colCountMuted: { flex: 2, textAlign: 'right', color: C.muted },
  totalColRevenue: { flex: 3, textAlign: 'right', color: C.primary },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },
});
