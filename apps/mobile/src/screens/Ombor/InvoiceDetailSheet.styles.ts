import { StyleSheet } from 'react-native';
import { C } from './OmborColors';

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

  // ─── Meta row ──────────────────────────────────
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 14,
  },
  invoiceNumber: {
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
  invoiceDate: {
    fontSize: 12,
    color: C.muted,
    marginLeft: 'auto',
  },

  // ─── Divider ───────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 4,
  },
  dividerMt: {
    marginTop: 12,
  },

  // ─── Info block ────────────────────────────────
  infoBlock: {
    backgroundColor: C.bg,
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: C.muted,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: C.text,
    flex: 1,
    textAlign: 'right',
  },

  // ─── Section label ─────────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
  },

  // ─── Item rows ─────────────────────────────────
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
  },
  itemLeft: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: C.text,
  },
  itemMeta: {
    fontSize: 12,
    color: C.muted,
  },
  itemBatch: {
    fontSize: 11,
    color: C.muted,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },

  emptyItems: {
    fontSize: 13,
    color: C.muted,
    paddingVertical: 12,
    textAlign: 'center',
  },

  // ─── Total row ─────────────────────────────────
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: C.text,
  },

  // ─── Action buttons ────────────────────────────
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  approveBtn: {
    flex: 2,
    backgroundColor: C.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: C.red,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  approveBtnDisabled: {
    opacity: 0.6,
  },
  approveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
});
