import i18n from '../i18n';

export type AgingBucketKey = '0_30' | '31_60' | '61_90' | '90_plus';

export function getAgingBucket(daysOverdue: number): AgingBucketKey {
  if (daysOverdue <= 30) return '0_30';
  if (daysOverdue <= 60) return '31_60';
  if (daysOverdue <= 90) return '61_90';
  return '90_plus';
}

export function getAgingBucketLabel(bucket: string): string {
  const t = i18n.t.bind(i18n);
  const labels: Record<string, string> = {
    '0_30': t('debts.bucket030'),
    '31_60': t('debts.bucket3160'),
    '61_90': t('debts.bucket6190'),
    '90_plus': t('debts.bucket90plus'),
  };
  return labels[bucket] ?? bucket;
}
