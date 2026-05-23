// NewTransferSheet.styles.ts — stillar (NewTransferSheet uchun)

import { StyleSheet } from 'react-native';
import { C } from './StockTransferColors';

export const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:  'flex-end',
  },
  kav: { width: '100%' },
  sheet: {
    backgroundColor:      C.white,
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    paddingHorizontal:    20,
    paddingTop:           12,
    paddingBottom:        40,
    maxHeight:            '92%' as const,
  },
  handle: {
    width:           36,
    height:          4,
    borderRadius:    2,
    backgroundColor: C.border,
    alignSelf:       'center',
    marginBottom:    14,
  },
  titleRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   16,
  },
  title: {
    fontSize:   18,
    fontWeight: '800',
    color:      C.text,
  },
  closeBtn: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: C.bg,
    borderWidth:     1,
    borderColor:     C.border,
    alignItems:      'center',
    justifyContent:  'center',
  },
  scroll: { flexShrink: 1 },

  label: {
    fontSize:     13,
    fontWeight:   '600',
    color:        '#374151',
    marginBottom: 8,
  },
  labelTop: { marginTop: 16 },

  branchLoader: { marginVertical: 8 },

  // Filial chip-lar
  chipRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       C.border,
    backgroundColor:   C.white,
    minHeight:         36,
    justifyContent:    'center',
  },
  chipActive: {
    borderColor:     C.primary,
    backgroundColor: C.primary + '12',
  },
  chipSameDisabled: {
    borderColor:     C.border,
    backgroundColor: C.bg,
    opacity:         0.5,
  },
  chipText: {
    fontSize:   13,
    fontWeight: '500',
    color:      C.secondary,
  },
  chipTextActive: {
    color:      C.primary,
    fontWeight: '700',
  },
  chipTextDisabled: {
    color: C.muted,
  },

  // Qo'shilgan mahsulot satri
  addedItemRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: C.bg,
    borderRadius:    10,
    padding:         10,
    marginBottom:    6,
    borderWidth:     1,
    borderColor:     C.border,
  },
  addedItemInfo: {
    flex: 1,
    gap:  2,
  },
  addedItemName: {
    fontSize:   14,
    fontWeight: '600',
    color:      C.text,
  },
  addedItemMeta: {
    fontSize: 11,
    color:    C.secondary,
  },
  qtyInput: {
    borderWidth:       1,
    borderColor:       C.border,
    borderRadius:      8,
    paddingHorizontal: 10,
    paddingVertical:   6,
    fontSize:          14,
    color:             C.text,
    backgroundColor:   C.white,
    width:             70,
    textAlign:         'center',
  },
  removeBtn: {
    padding: 2,
  },

  // Mahsulot qo'shish tugmasi
  addProductBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             8,
    paddingVertical: 12,
    borderRadius:    10,
    borderWidth:     1,
    borderColor:     C.primary + '40',
    backgroundColor: C.primary + '08',
  },
  addProductBtnText: {
    fontSize:   14,
    fontWeight: '600',
    color:      C.primary,
  },

  // Qidiruv paneli
  searchPanel: {
    marginTop:       8,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     C.border,
    backgroundColor: C.white,
    overflow:        'hidden',
  },
  searchInputRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    paddingHorizontal: 12,
    paddingVertical:   10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  searchInput: {
    flex:     1,
    fontSize: 14,
    color:    C.text,
    padding:  0,
  },
  searchEmpty: {
    paddingVertical: 20,
    alignItems:      'center',
  },
  searchEmptyText: {
    fontSize: 14,
    color:    C.muted,
  },
  searchResultRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 12,
    paddingVertical:   10,
    gap:               10,
  },
  searchResultRowAdded: {
    backgroundColor: '#F0FDF4',
  },
  searchResultInfo: { flex: 1, gap: 2 },
  searchResultName: {
    fontSize:   14,
    fontWeight: '600',
    color:      C.text,
  },
  searchResultMeta: {
    fontSize: 12,
    color:    C.secondary,
  },
  searchSeparator: {
    height:          1,
    backgroundColor: C.border,
    marginHorizontal: 12,
  },

  // Input (izoh)
  input: {
    borderWidth:       1,
    borderColor:       C.border,
    borderRadius:      10,
    paddingHorizontal: 14,
    paddingVertical:   12,
    fontSize:          15,
    color:             C.text,
    backgroundColor:   C.bg,
  },
  inputMultiline: {
    height:     80,
    paddingTop: 12,
  },

  // Tugmalar
  actions: {
    flexDirection: 'row',
    gap:           10,
    marginTop:     20,
  },
  cancelBtn: {
    flex:            1,
    borderWidth:     1,
    borderColor:     C.border,
    borderRadius:    12,
    paddingVertical: 14,
    alignItems:      'center',
  },
  cancelBtnText: {
    fontSize:   15,
    fontWeight: '600',
    color:      C.secondary,
  },
  submitBtn: {
    flex:            2,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             6,
    backgroundColor: C.primary,
    borderRadius:    12,
    paddingVertical: 14,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    fontSize:   15,
    fontWeight: '700',
    color:      C.white,
  },
});
