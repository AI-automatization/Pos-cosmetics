export type PeriodKey = '7d' | '30d' | '90d';

export const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: '7d', label: '7 kun', days: 7 },
  { key: '30d', label: '30 kun', days: 30 },
  { key: '90d', label: '90 kun', days: 90 },
];

export function formatAmount(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B UZS`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M UZS`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K UZS`;
  }
  return `${amount.toLocaleString('uz-UZ')} UZS`;
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = [
      'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun',
      'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek',
    ];
    const month = months[d.getMonth()];
    const weekDays = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'];
    const weekDay = weekDays[d.getDay()];
    return `${weekDay}, ${day}-${month}`;
  } catch {
    return dateStr;
  }
}

export function getDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split('T')[0] ?? '',
    to: to.toISOString().split('T')[0] ?? '',
  };
}
