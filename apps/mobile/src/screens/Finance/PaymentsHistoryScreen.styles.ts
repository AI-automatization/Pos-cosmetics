import { StyleSheet } from 'react-native';
import { C } from './paymentsHistory.helpers';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconBlue: { backgroundColor: '#EFF6FF' },

  searchWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  pillsScroll: { flexGrow: 0, backgroundColor: C.white },
  pillsRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  methodPillActive: { backgroundColor: '#111827', borderColor: '#111827' },
  methodPillText: { fontSize: 12, fontWeight: '600', color: C.muted },
  methodPillTextActive: { color: C.white },

  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 10,
    marginBottom: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: C.muted, fontWeight: '600' },
  summaryValue: { fontSize: 14, fontWeight: '800', color: C.text, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: C.border, marginVertical: 2 },

  flatList: { flex: 1 },
  loader: { marginTop: 40 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  separator: { height: 10 },

  statRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginTop: 12,
  },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 15, color: C.muted, fontWeight: '600' },
  emptySub: { fontSize: 12, color: C.muted },
});
