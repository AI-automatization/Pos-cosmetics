import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useCurrency } from '../../hooks/useCurrency';

interface CurrencyTextProps {
  amount: number;
  style?: TextStyle;
}

export default function CurrencyText({ amount, style }: CurrencyTextProps) {
  const { formatAmount } = useCurrency();
  return <Text style={style}>{formatAmount(amount)}</Text>;
}
