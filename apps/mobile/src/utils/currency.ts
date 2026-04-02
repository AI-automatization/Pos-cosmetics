export function formatUZS(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + ' so\'m';
}

export function formatCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1) + ' mlrd';
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + ' mln';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + ' ming';
  }
  return String(Math.round(amount));
}

export function formatTrend(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}
