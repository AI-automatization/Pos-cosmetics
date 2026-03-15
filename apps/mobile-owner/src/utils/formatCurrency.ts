export function formatCurrency(amount: number, currency: string = 'UZS'): string {
  const formatted = new Intl.NumberFormat('uz-UZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `${formatted} ${currency}`;
}
