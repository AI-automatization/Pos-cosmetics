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
  teal:    '#0D9488',
};

// ─── Helpers ───────────────────────────────────────────
export function fmtUzs(n: number): string {
  const abs = Math.abs(Number(n));
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (Number(n) < 0 ? '-' : '') + formatted + ' UZS';
}

// ─── Period config ─────────────────────────────────────
export type PeriodKey = 'week' | 'month' | 'year';

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'week',  label: 'Hafta' },
  { key: 'month', label: 'Oy'    },
  { key: 'year',  label: 'Yil'   },
];

// ─── Styles ────────────────────────────────────────────
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },
  headerSpacer: { width: 36 },

  pillsBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  loader: { marginTop: 40 },

  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 10 },

  // Summary card
  summaryCard: {
    backgroundColor: C.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  summaryValue: { fontSize: 24, fontWeight: '800', color: C.white, marginTop: 4 },
  summaryMeta: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },

  // Branch card
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchName: { flex: 1, fontSize: 15, fontWeight: '700', color: C.text },

  revenueValue: { fontSize: 20, fontWeight: '800', color: C.text },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 13, color: C.muted, fontWeight: '500' },
  stockValue: { fontSize: 12, color: C.muted, fontWeight: '500' },

  // Trend badge
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  trendBadgeGreen: { backgroundColor: '#F0FDF4' },
  trendBadgeRed: { backgroundColor: '#FEF2F2' },
  trendText: { fontSize: 12, fontWeight: '700' },
  trendTextGreen: { color: C.green },
  trendTextRed: { color: C.red },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },
});
