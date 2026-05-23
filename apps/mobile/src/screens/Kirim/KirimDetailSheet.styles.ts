import { StyleSheet } from 'react-native';
import { C } from './KirimColors';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  receiptIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptNumber: { fontSize: 17, fontWeight: '800', color: C.text },
  supplierName:  { fontSize: 13, color: C.secondary, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Info section
  infoSection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoDivider: {
    width: 1,
    backgroundColor: C.border,
    marginVertical: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: C.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoValueBold: {
    color: C.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Notes
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  notesText: { fontSize: 12, color: C.orange, flex: 1, lineHeight: 18 },

  // Scroll / Items
  scroll: { maxHeight: 280 },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  itemsTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  itemsCountBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  itemsCount: { fontSize: 12, color: C.primary, fontWeight: '600' },

  emptyItems: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyItemsText: { fontSize: 13, color: C.muted },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  itemRowLast: { borderBottomWidth: 0 },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  itemNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600', color: C.text, lineHeight: 18 },
  itemCost: { fontSize: 11, color: C.muted, marginTop: 2 },
  itemAmounts: { alignItems: 'flex-end', gap: 3 },
  itemQty:   { fontSize: 13, fontWeight: '700', color: C.text },
  itemTotal: { fontSize: 12, color: C.secondary },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: { fontSize: 14, color: C.secondary },
  footerValue: { fontSize: 15, fontWeight: '700', color: C.text },
  footerValueHighlight: { fontSize: 17, color: C.primary },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  cancelBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  acceptBtn: {
    backgroundColor: C.green,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtnText: { color: C.red },
  acceptBtnText: { color: C.white },
});
