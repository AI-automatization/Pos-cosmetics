import { ShiftReport } from '../../api/shifts.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors } from '../../config/theme';

// ─── Period config ─────────────────────────────────────
export type PeriodKey = 'today' | '7d' | '30d';

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Bugun' },
  { key: '7d', label: '7 kun' },
  { key: '30d', label: '30 kun' },
];

export function periodDates(key: PeriodKey): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0]!;
  switch (key) {
    case 'today':
      return { from: to, to };
    case '7d': {
      const d = new Date(now);
      d.setDate(now.getDate() - 6);
      return { from: d.toISOString().split('T')[0]!, to };
    }
    case '30d': {
      const d = new Date(now);
      d.setDate(now.getDate() - 29);
      return { from: d.toISOString().split('T')[0]!, to };
    }
  }
}

// ─── Helpers ──────────────────────────────────────────
export function discrepancyColor(d: number | null): string {
  if (d === null) return Colors.textMuted;
  if (d === 0) return Colors.success;
  if (d < 0) return Colors.danger;
  return Colors.info;
}

export function discrepancyLabel(d: number | null): string {
  if (d === null) return '---';
  if (d === 0) return '0 UZS (OK)';
  const sign = d > 0 ? '+' : '';
  return `${sign}${formatCurrency(d)}`;
}

// ─── Mock data ────────────────────────────────────────
export const MOCK_SHIFTS: ShiftReport[] = [
  {
    id: 'sr1',
    cashierName: 'Sarvar Qodirov',
    branchName: 'Chilonzor',
    openedAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    closedAt: null,
    status: 'open',
    totalRevenue: 8_450_000,
    totalOrders: 34,
    cashRevenue: 3_200_000,
    cardRevenue: 5_250_000,
    openingCash: 500_000,
    expectedCash: 3_700_000,
    closingCash: null,
    discrepancy: null,
  },
  {
    id: 'sr2',
    cashierName: 'Muhabbat Tosheva',
    branchName: 'Chilonzor',
    openedAt: new Date(Date.now() - 28 * 3600_000).toISOString(),
    closedAt: new Date(Date.now() - 20 * 3600_000).toISOString(),
    status: 'closed',
    totalRevenue: 12_780_000,
    totalOrders: 58,
    cashRevenue: 5_200_000,
    cardRevenue: 7_580_000,
    openingCash: 500_000,
    expectedCash: 5_700_000,
    closingCash: 5_700_000,
    discrepancy: 0,
  },
  {
    id: 'sr3',
    cashierName: 'Jahongir Nazarov',
    branchName: 'Yunusabad',
    openedAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    closedAt: new Date(Date.now() - 18 * 3600_000).toISOString(),
    status: 'closed',
    totalRevenue: 9_340_000,
    totalOrders: 42,
    cashRevenue: 3_800_000,
    cardRevenue: 5_540_000,
    openingCash: 500_000,
    expectedCash: 4_300_000,
    closingCash: 4_150_000,
    discrepancy: -150_000,
  },
  {
    id: 'sr4',
    cashierName: 'Zulfiya Ergasheva',
    branchName: "Mirzo Ulug'bek",
    openedAt: new Date(Date.now() - 52 * 3600_000).toISOString(),
    closedAt: new Date(Date.now() - 44 * 3600_000).toISOString(),
    status: 'closed',
    totalRevenue: 6_890_000,
    totalOrders: 31,
    cashRevenue: 2_900_000,
    cardRevenue: 3_990_000,
    openingCash: 500_000,
    expectedCash: 3_400_000,
    closingCash: 3_480_000,
    discrepancy: 80_000,
  },
];
