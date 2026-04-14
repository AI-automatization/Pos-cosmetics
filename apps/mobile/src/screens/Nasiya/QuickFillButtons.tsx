import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatUZS } from '../../utils/currency';

interface Props {
  remaining: number;
  onFill: (amount: string) => void;
}

const RATIOS = [0.5, 1] as const;

export default function QuickFillButtons({ remaining, onFill }: Props) {
  return (
    <View style={styles.container}>
      {RATIOS.map((ratio) => {
        const val = Math.round(remaining * ratio);
        return (
          <TouchableOpacity
            key={ratio}
            style={styles.btn}
            onPress={() => onFill(String(val))}
            activeOpacity={0.75}
          >
            <Text style={styles.btnLabel}>
              {ratio === 1 ? "To'liq" : `${ratio * 100}%`}
            </Text>
            <Text style={styles.btnAmount}>{formatUZS(val)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  btn: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  btnLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  btnAmount: {
    fontSize: 11,
    color: '#2563EB',
    marginTop: 2,
  },
});
