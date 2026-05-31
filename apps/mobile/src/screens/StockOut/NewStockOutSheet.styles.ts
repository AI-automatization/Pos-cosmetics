// NewStockOutSheet.styles.ts — stillar

import { StyleSheet } from 'react-native';
import { C } from './StockOutColors';

export const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:  'flex-end',
  },
  kav:   { width: '100%' },
  sheet: {
    backgroundColor:      C.white,
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    paddingHorizontal:    20,
    paddingTop:           12,
    paddingBottom:        40,
    maxHeight:            '90%' as const,
  },
  handle: {
    width:        36,
    height:       4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf:    'center',
    marginBottom: 14,
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
    marginBottom: 6,
  },
  labelTop: { marginTop: 16 },
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
    backgroundColor: C.red,
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
