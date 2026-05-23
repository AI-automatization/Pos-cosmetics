import { StyleSheet, Platform } from 'react-native';
import { C } from './StockTransferColors';

export const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: C.muted,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: C.primary,
    borderRadius: 8,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Filter
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterTabActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.muted,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardIdWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardId: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  branchBox: {
    flex: 1,
  },
  branchBoxRight: {
    alignItems: 'flex-end',
  },
  branchLabel: {
    fontSize: 11,
    color: C.muted,
    marginBottom: 2,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '600',
    color: C.text,
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  itemsWrap: {
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 13,
    color: C.text,
    flex: 1,
    marginRight: 8,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },
  moreItems: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  footerMeta: {
    fontSize: 12,
    color: C.muted,
  },
  footerDot: {
    fontSize: 12,
    color: C.muted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
