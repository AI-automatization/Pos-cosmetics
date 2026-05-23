import { StyleSheet } from 'react-native';

// ─── Colors ────────────────────────────────────────────
export const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
  red:     '#DC2626',
  orange:  '#D97706',
};

// ─── Styles ────────────────────────────────────────────
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  headerIconBlue: { backgroundColor: '#EFF6FF' },

  content: { paddingBottom: 40 },

  pillsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  loader: { marginTop: 40 },

  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60,
  },
  emptyText: { fontSize: 15, color: '#9CA3AF' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, paddingHorizontal: 16, marginTop: 16, marginBottom: 8,
  },

  cardGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 8,
  },
  statCard: {
    width: '47%', flexGrow: 1,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: { fontSize: 11, fontWeight: '600', color: C.muted, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: C.text },
  statSub: { fontSize: 11, color: C.muted, marginTop: 3 },

  breakdownCard: {
    marginHorizontal: 16,
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    paddingVertical: 4,
  },
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  breakdownDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary,
  },
  breakdownMethod: { fontSize: 14, fontWeight: '600', color: C.text },
  breakdownAmount: { fontSize: 14, fontWeight: '700', color: C.primary },
  breakdownDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 14 },

  navGrid: {
    paddingHorizontal: 16, gap: 8,
  },
  navCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14, gap: 12,
  },
  navIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  navLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  navChevron: { marginLeft: 'auto' },
});
