import { StyleSheet } from 'react-native';
import { Colors, Radii } from '../../config/theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgApp },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  headerSpacer: { width: 36 },

  pillsBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: Radii.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  pillTextActive: { color: Colors.textWhite },

  loader: { marginTop: 40 },
  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 10 },

  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    padding: 18,
    marginBottom: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryMain: { flex: 1 },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  summaryValue: { fontSize: 24, fontWeight: '800', color: Colors.textWhite, marginTop: 4 },
  summaryGrowth: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.xl,
  },
  summaryBottom: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  summaryMiniItem: { flex: 1, alignItems: 'center' },
  summaryMiniLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  summaryMiniValue: { fontSize: 15, fontWeight: '800', color: Colors.textWhite, marginTop: 2 },
  summaryMiniDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 2,
  },

  growthPos: { backgroundColor: Colors.successLight },
  growthNeg: { backgroundColor: Colors.dangerLight },
  growthText: { fontSize: 12, fontWeight: '700' },
  growthTextPos: { color: Colors.success },
  growthTextNeg: { color: Colors.danger },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  emptySubtitle: { fontSize: 13, color: Colors.textMuted },
});
