import { StyleSheet } from 'react-native';
import { C } from './components/utils';

export const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flatList:    { flex: 1 },
  grid:        { paddingHorizontal: 11, paddingBottom: 100, flexGrow: 1 },
  empty:        { paddingTop: 80, alignItems: 'center', gap: 8 },
  emptyText:    { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  emptySubText: { fontSize: 13, color: '#9CA3AF' },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  offlineBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },
});
