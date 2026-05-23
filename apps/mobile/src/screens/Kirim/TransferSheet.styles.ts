import { StyleSheet } from 'react-native';
import { C } from './KirimColors';

export const styles = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  kav:       { width: '100%' },
  sheet: {
    backgroundColor:      C.white,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    padding:              24,
    paddingBottom:        40,
    maxHeight:            '92%' as const,
  },
  handle:    { width: 40, height: 5, borderRadius: 2.5, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
  titleRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title:     { fontSize: 20, fontWeight: '800', color: C.text },
  closeBtn:  { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  scroll:    { flexShrink: 1 },
  label:     { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  labelMarginTop:   { marginTop: 16 },
  labelMarginTopSm: { marginTop: 10 },

  // Branch chips
  branchList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  branchChip: {
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderRadius:      20,
    borderWidth:       1.5,
    borderColor:       '#E5E7EB',
    backgroundColor:   C.white,
  },
  branchChipActive:       { borderColor: C.primary, backgroundColor: C.primary + '15' },
  branchChipDisabled:     { opacity: 0.35 },
  branchChipText:         { fontSize: 13, color: C.secondary, fontWeight: '500' },
  branchChipTextActive:   { color: C.primary, fontWeight: '700' },
  branchChipTextDisabled: { color: C.muted },

  // Route indicator
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: C.primary + '0D',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  routeText: { flex: 1, fontSize: 13, fontWeight: '600', color: C.primary, textAlign: 'center' },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: C.text },
  itemQty:  { fontSize: 12, color: C.muted, marginTop: 2 },

  // Add form
  addForm: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  addFormTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 10 },
  selectedProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.primary + '15',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  selectedProductName: { flex: 1, fontSize: 14, fontWeight: '600', color: C.primary },
  productSuggestion: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productSuggestionName: { fontSize: 14, color: C.text, fontWeight: '500' },
  productSuggestionSku:  { fontSize: 12, color: C.muted },
  addFormBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  cancelSmallBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelSmallBtnText: { fontSize: 14, color: C.secondary, fontWeight: '600' },
  addSmallBtn: {
    flex: 2,
    backgroundColor: C.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addSmallBtnText: { fontSize: 14, color: C.white, fontWeight: '700' },

  // Add item button
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: C.primary,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 8,
  },
  addItemBtnText: { fontSize: 14, color: C.primary, fontWeight: '600' },

  // Input
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    backgroundColor: C.white,
  },
  inputMultiline: { height: 72, textAlignVertical: 'top', paddingTop: 12 },

  // Actions
  actions:       { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn:     { flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: C.secondary },
  submitBtn:     { flex: 2, backgroundColor: C.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  btnDisabled:   { opacity: 0.6 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: C.white },
});
