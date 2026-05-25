import { StyleSheet } from 'react-native';
import { Colors, Radii } from '../../config/theme';

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgApp },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },

  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Radii.sm,
    backgroundColor: Colors.bgSubtle,
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  periodTextActive: {
    color: Colors.textWhite,
  },

  loader: { flex: 1 },
  listContent: { paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTextGreen: { fontSize: 16, color: Colors.success, fontWeight: '700' },
  emptyTextSub: { fontSize: 13, color: Colors.textMuted },

  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    backgroundColor: Colors.warningLight,
    borderRadius: Radii.lg,
  },
  alertInfo: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  alertSub: { fontSize: 12, color: Colors.warning, marginTop: 2 },

  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  summarySub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  searchRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    padding: 0,
  },

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginRight: 4,
  },
  sortTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.sm,
    backgroundColor: Colors.bgSubtle,
  },
  sortTabActive: {
    backgroundColor: Colors.primary,
  },
  sortText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  sortTextActive: { color: Colors.textWhite },
});
