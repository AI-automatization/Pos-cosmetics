import { Platform, StyleSheet } from 'react-native';
import { C } from './OmborColors';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  headerCount: {
    fontSize: 14,
    color: C.muted,
  },

  // Search
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: C.white,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.text,
    padding: 0,
  },

  // Filter tabs
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center',
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: C.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
  },
  filterTabTextActive: {
    color: C.white,
  },
  filterBadge: {
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.secondary,
  },
  filterBadgeTextActive: {
    color: C.white,
  },

  resultCount: {
    fontSize: 12,
    color: C.muted,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // List
  listContent: {
    padding: 16,
  },

  // Card
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    marginBottom: 10,
    padding: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  cardRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardRowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  invoiceNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: C.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 13,
    color: C.muted,
  },
  cardDate: {
    fontSize: 12,
    color: C.muted,
  },
  cardTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: C.primary,
  },

  // States
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 80,
  },
  errorText: {
    fontSize: 15,
    color: C.muted,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: C.primary,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
  emptyState: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
  },
});
