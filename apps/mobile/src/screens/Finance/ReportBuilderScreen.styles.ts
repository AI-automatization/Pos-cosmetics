import { StyleSheet } from 'react-native';

// ─── Colors ───────────────────────────────────────────────
export const C = {
  bg:          '#F9FAFB',
  white:       '#FFFFFF',
  text:        '#111827',
  muted:       '#6B7280',
  border:      '#E5E7EB',
  primary:     '#2563EB',
  primaryLight:'#EFF6FF',
  tableHeader: '#F3F4F6',
} as const;

// ─── Styles ───────────────────────────────────────────────
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

  content: { padding: 16, paddingBottom: 48, gap: 16 },

  section: { gap: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: C.muted },

  optionsRow: { flexDirection: 'row', gap: 8 },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: 'center',
  },
  optionBtnActive: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary,
  },
  optionText: { fontSize: 13, fontWeight: '600', color: C.muted },
  optionTextActive: { color: C.primary },

  actionsRow: { flexDirection: 'row', gap: 12 },
  runBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    minHeight: 48,
  },
  runBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
  clearBtn: {
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  clearBtnText: { fontSize: 14, fontWeight: '600', color: C.muted },

  divider: { height: 1, backgroundColor: C.border },

  loader: { marginTop: 24 },
  errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center', marginTop: 24 },
  emptyText: { fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 24 },

  // Table
  tableCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: C.tableHeader,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tableHeadCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  tableRowAlt: { backgroundColor: C.tableHeader },
  tableCell: { flex: 1, fontSize: 13, color: C.text },
  tableCellFlex2: { flex: 2 },
  tableCellRight: { textAlign: 'right' },

  tableFoot: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: C.primaryLight,
    borderTopWidth: 1.5,
    borderTopColor: C.primary + '40',
  },
  tableFootCell: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: C.primary,
  },
});
