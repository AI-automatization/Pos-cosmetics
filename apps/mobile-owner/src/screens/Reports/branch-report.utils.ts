import { BranchReport } from '../../api/analytics.api';
import { Colors } from '../../config/theme';

// ─── Period config ─────────────────────────────────────
export type PeriodKey = 'today' | 'week' | 'month' | 'year';

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Bugun' },
  { key: 'week', label: 'Hafta' },
  { key: 'month', label: 'Oy' },
  { key: 'year', label: 'Yil' },
];

// ─── Rank badge colors ────────────────────────────────
export const RANK_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#FEF3C7', text: '#D97706' },
  2: { bg: '#E5E7EB', text: '#6B7280' },
  3: { bg: '#FFEDD5', text: '#EA580C' },
};

export const DEFAULT_RANK = { bg: Colors.bgSubtle, text: Colors.textMuted };

// ─── Mock data ────────────────────────────────────────
export const MOCK_BRANCHES: BranchReport[] = [
  {
    branchId: 'b1',
    branchName: 'Chilonzor',
    revenue: 48_720_000,
    orders: 247,
    avgOrderValue: 197_247,
    growth: 12.4,
  },
  {
    branchId: 'b2',
    branchName: 'Yunusabad',
    revenue: 35_600_000,
    orders: 189,
    avgOrderValue: 188_360,
    growth: 8.1,
  },
  {
    branchId: 'b3',
    branchName: "Mirzo Ulug'bek",
    revenue: 28_450_000,
    orders: 156,
    avgOrderValue: 182_372,
    growth: -3.2,
  },
  {
    branchId: 'b4',
    branchName: 'Sergeli',
    revenue: 18_900_000,
    orders: 104,
    avgOrderValue: 181_731,
    growth: 5.6,
  },
];
