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
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textMuted, fontWeight: '600' },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
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

  // Group card
  groupCard: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  groupBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupLetter: { fontSize: 18, fontWeight: '800' },
  groupInfo: { flex: 1 },
  groupLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  groupSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  groupRight: { alignItems: 'flex-end', gap: 2 },
  groupRevenue: { fontSize: 15, fontWeight: '800' },
  shareBarBg: {
    height: 4,
    backgroundColor: Colors.bgSubtle,
    marginHorizontal: 14,
    borderRadius: 2,
  },
  shareBarFill: { height: 4, borderRadius: 2 },

  // Product list
  productList: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 10,
  },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productRank: {
    width: 18,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  productMiddle: { flex: 1, gap: 3 },
  productName: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  productBarBg: {
    height: 5,
    backgroundColor: Colors.bgSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  productBarFill: { height: 5, borderRadius: 3 },
  productRight: { alignItems: 'flex-end', minWidth: 70 },
  productRevenue: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  productPct: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
});
