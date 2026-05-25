import { StyleSheet } from 'react-native';

const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
};

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

  pillsScroll: {
    flexGrow: 0, flexShrink: 0, backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  pillsContent: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  pill: {
    flexShrink: 0,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  summaryRow: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.border,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  summaryValue: { fontSize: 15, fontWeight: '800', color: C.text, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  loader: { marginTop: 40 },
  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 12 },

  card: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: 8,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shiftNumBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  shiftNumOpen:   { backgroundColor: '#F0FDF4' },
  shiftNumClosed: { backgroundColor: C.bg },
  shiftNum: { fontSize: 13, fontWeight: '800' },
  cardDate: { fontSize: 14, fontWeight: '700', color: C.text },
  cardTime: { fontSize: 12, color: C.muted, marginTop: 1 },

  cardHeaderRight: { alignItems: 'flex-end', gap: 4 },
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  statusOpen:   { backgroundColor: '#F0FDF4' },
  statusClosed: { backgroundColor: C.bg },
  statusText: { fontSize: 11, fontWeight: '700' },
  durText: { fontSize: 12, color: C.muted },

  cashierRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10,
  },
  cashierName: { fontSize: 13, color: C.muted, fontWeight: '500' },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 10 },

  statsGrid: { flexDirection: 'row' },
  statCell: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: C.muted, fontWeight: '600', marginBottom: 3 },
  statValue: { fontSize: 13, fontWeight: '700', color: C.text },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  totalLabel: { fontSize: 13, fontWeight: '600', color: C.muted },
  totalValue: { fontSize: 16, fontWeight: '800', color: C.primary },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 15, color: C.muted, fontWeight: '600' },

  spacer: { width: 36 },
});
