/**
 * Format amount in UZS (Uzbek Som)
 * All amounts stored as integer (tiyin) in DB — divide by 100 for display.
 */
export function formatUZS(amountInTiyin: number): string {
  const som = amountInTiyin / 100;
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(som);
}

/**
 * Convert som to tiyin for storage
 */
export function somToTiyin(som: number): number {
  return Math.round(som * 100);
}

/**
 * Safely serialize BigInt to string for JSON
 */
export function bigIntToString(value: bigint): string {
  return value.toString();
}
