/**
 * UZS Currency Utilities (T-080)
 * O'zbekistonda amalda tiyin yo'q.
 * Narxlar 100 yoki 1000 ga yaxlitlanadi (configga qarab).
 */

export type RoundingPrecision = 100 | 1000;

/**
 * UZS summasini yaxlitlash.
 * @param amount - Hisoblangan summa (so'm)
 * @param precision - Yaxlitlash qadami (100 yoki 1000). Default: 100
 * @returns Yaxlitlangan summa
 */
export function roundUZS(amount: number, precision: RoundingPrecision = 100): number {
  return Math.round(amount / precision) * precision;
}

/**
 * Yaxlitlash farqini hisoblash (ledger uchun).
 * @returns { original, rounded, difference }
 */
export function roundingDiff(
  amount: number,
  precision: RoundingPrecision = 100,
): { original: number; rounded: number; difference: number } {
  const rounded = roundUZS(amount, precision);
  return { original: amount, rounded, difference: rounded - amount };
}

/**
 * NDS (QQS) hisoblash — O'zbekiston 12% (T-078)
 */
export const UZ_VAT_RATE = 0.12;

/**
 * Tax-inclusive narxdan QQS ajratish.
 * UZ standart: narx QQS bilan birga (tax-inclusive).
 * vatAmount = total * (rate / (1 + rate))
 * subtotal = total - vatAmount
 */
export function extractVAT(
  total: number,
  rate = UZ_VAT_RATE,
): { subtotal: number; vatAmount: number; total: number } {
  const vatAmount = total * (rate / (1 + rate));
  const subtotal = total - vatAmount;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total,
  };
}

/**
 * Tax-exclusive narxga QQS qo'shish.
 * subtotal + subtotal * rate = total
 */
export function addVAT(
  subtotal: number,
  rate = UZ_VAT_RATE,
): { subtotal: number; vatAmount: number; total: number } {
  const vatAmount = subtotal * rate;
  const total = subtotal + vatAmount;
  return {
    subtotal,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
