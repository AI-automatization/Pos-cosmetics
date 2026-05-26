import { StyleSheet } from 'react-native';

// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
  red:     '#DC2626',
  orange:  '#D97706',
} as const;

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

  content: { paddingBottom: 40 },

  pillsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  loader: { marginTop: 40 },

  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60,
  },
  emptyText: { fontSize: 15, color: '#9CA3AF' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, paddingHorizontal: 16, marginTop: 16, marginBottom: 8,
  },

  // KPI
  kpiGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 8,
  },
  kpiCard: {
    width: '47%', flexGrow: 1,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  kpiIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  kpiLabel: { fontSize: 11, fontWeight: '600', color: C.muted, marginBottom: 4 },
  kpiValue: { fontSize: 18, fontWeight: '800' },
  kpiSub: { fontSize: 11, color: C.muted, marginTop: 3 },

  // Table
  tableCard: {
    marginHorizontal: 16,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  tableSectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8,
  },
  tableSectionTitle: {
    fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8,
  },
  tableRowIndent: { paddingLeft: 12 },
  tableLabel: { fontSize: 14, color: C.text, flex: 1 },
  tableLabelBold: { fontWeight: '700' },
  tableLabelIndent: { color: C.muted, fontSize: 13 },
  tableValue: { fontSize: 14, color: C.text, fontWeight: '500' },
  tableValueBold: { fontWeight: '800', fontSize: 15 },
  tableDivider: { height: 1, backgroundColor: C.border, marginVertical: 4 },

  netRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 2, borderTopColor: C.border,
  },
  netLabel: { fontSize: 13, fontWeight: '800', color: C.text, letterSpacing: 0.5 },
  netValue: { fontSize: 18, fontWeight: '800' },

  // Segment bar
  segCard: {
    marginHorizontal: 16,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 16,
  },
  segBar: {
    flexDirection: 'row', height: 12, borderRadius: 6,
    overflow: 'hidden', backgroundColor: C.border, marginBottom: 16,
  },
  segSlice: { height: '100%' },
  segFirst: { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
  segLast: { borderTopRightRadius: 6, borderBottomRightRadius: 6 },

  legend: { gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 13, color: C.text, fontWeight: '500' },
  legendValue: { fontSize: 13, fontWeight: '700' },

  noDataRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border,
  },
  noDataText: { fontSize: 12, color: C.muted, flex: 1 },

  spacer: { width: 36 },
  tableSectionHeaderSpaced: { marginTop: 16 },
});
