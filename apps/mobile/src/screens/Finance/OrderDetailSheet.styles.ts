import { StyleSheet } from 'react-native';

// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  orange:  '#D97706',
  gray:    '#6B7280',
  red:     '#DC2626',
};

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 36,
    // Shadow
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },

  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
  },

  // ─── Meta row ──────────────────────────────
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 14,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: C.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderDate: {
    fontSize: 12,
    color: C.muted,
    marginLeft: 'auto',
  },

  // ─── Divider ───────────────────────────────
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 4,
  },

  // ─── Section label ─────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
  },

  // ─── Line items ────────────────────────────
  lineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
  },
  lineItemLeft: {
    flex: 1,
    gap: 2,
  },
  lineItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: C.text,
  },
  lineItemMeta: {
    fontSize: 12,
    color: C.muted,
  },
  lineItemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },

  emptyItems: {
    fontSize: 13,
    color: C.muted,
    paddingVertical: 12,
    textAlign: 'center',
  },

  // ─── Summary ───────────────────────────────
  summaryBlock: {
    marginTop: 8,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  summaryLabel: {
    fontSize: 13,
    color: C.muted,
  },
  summaryLabelBold: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },

  totalSeparator: {
    height: 2,
    backgroundColor: C.border,
    marginVertical: 10,
  },

  // ─── Note ──────────────────────────────────
  noteBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 14,
    backgroundColor: C.bg,
    borderRadius: 10,
    padding: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: C.gray,
    lineHeight: 18,
  },
});
