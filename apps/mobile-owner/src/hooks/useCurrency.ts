import { useCallback } from 'react';
import { formatCurrency } from '../utils/formatCurrency';

export function useCurrency(currency: string = 'UZS') {
  const formatAmount = useCallback(
    (amount: number): string => formatCurrency(amount, currency),
    [currency],
  );

  return { formatAmount };
}
