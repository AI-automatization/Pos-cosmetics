import { StyleSheet } from 'react-native';

// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  teal:    '#0891B2',
  tealBg:  '#ECFEFF',
  tealBorder: '#A5F3FC',
  green:   '#16A34A',
};

// ─── Styles ────────────────────────────────────────────
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
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
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    minWidth: 36,
    justifyContent: 'center',
  },
  syncBtnDisabled: { opacity: 0.7 },
  syncBtnText: { fontSize: 12, fontWeight: '700', color: C.white },

  // Content
  content: { paddingBottom: 40 },
  loaderWrap: { marginTop: 40, alignItems: 'center' },

  // Rate card
  rateCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: C.tealBg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.tealBorder,
    padding: 20,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  rateCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  rateCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rateValue: {
    fontSize: 32,
    fontWeight: '800',
    color: C.teal,
    letterSpacing: -0.5,
  },
  rateCurrency: {
    fontSize: 20,
    fontWeight: '700',
    color: C.teal,
  },
  rateCardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  rateMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rateMetaText: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '500',
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },

  // Table
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableHeadText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableHeadRight: { textAlign: 'right' },

  // History rows
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: C.white,
    marginHorizontal: 16,
  },
  historyDate: {
    fontSize: 14,
    color: C.muted,
    fontWeight: '500',
  },
  historyRate: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  rowDivider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },
  tableFooter: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },

  spacer: { width: 36 },
});
