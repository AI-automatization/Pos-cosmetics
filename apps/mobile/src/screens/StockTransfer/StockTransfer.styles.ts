// StockTransfer.styles.ts — asosiy ekran stillari

import { StyleSheet } from 'react-native';
import { C } from './StockTransferColors';

export const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: C.bg,
  },
  content: { paddingBottom: 32 },
  centerFill: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            16,
  },
  errorText: {
    fontSize: 15,
    color:    C.muted,
  },
  errorTextSmall: {
    fontSize:  12,
    color:     C.muted,
    marginTop: -8,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical:   10,
    borderRadius:      10,
    backgroundColor:   C.primary,
  },
  retryBtnText: {
    fontSize:   14,
    fontWeight: '700',
    color:      C.white,
  },

  // List header
  listHeader: {
    paddingTop: 16,
    gap:        12,
  },
  statsRow: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  C.white,
    marginHorizontal: 16,
    borderRadius:     12,
    borderWidth:      1,
    borderColor:      C.border,
    paddingVertical:  12,
  },
  statItem: {
    flex:       1,
    alignItems: 'center',
    gap:        2,
  },
  statValue: {
    fontSize:   18,
    fontWeight: '800',
    color:      C.text,
  },
  statLabel: {
    fontSize: 11,
    color:    C.muted,
  },
  statDivider: {
    width:           1,
    height:          32,
    backgroundColor: C.border,
  },

  // Qidiruv
  searchBox: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    backgroundColor:   C.white,
    marginHorizontal:  16,
    borderRadius:      10,
    borderWidth:       1,
    borderColor:       C.border,
    paddingHorizontal: 12,
    paddingVertical:   10,
  },
  searchInput: {
    flex:     1,
    fontSize: 14,
    color:    C.text,
    padding:  0,
  },
  resultCount: {
    fontSize:          12,
    color:             C.muted,
    paddingHorizontal: 20,
    marginTop:         -4,
  },

  separator: { height: 10 },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap:        12,
  },
  emptyText: {
    fontSize: 15,
    color:    C.muted,
  },
  clearSearch: {
    fontSize:   14,
    color:      C.primary,
    fontWeight: '600',
  },

  // Tabs
  tabs: {
    flexDirection:     'row',
    backgroundColor:   C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingVertical:   12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: C.primary,
  },
  tabText: {
    fontSize:   14,
    fontWeight: '600',
    color:      C.muted,
  },
  tabTextActive: {
    color: C.primary,
  },
});
