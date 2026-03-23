import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatUZS } from '../../utils/currency';

interface Props {
  remaining: number;
  onFill: (amount: string) => void;
}

const RATIOS = [0.25, 0.5, 1] as const;

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
  container: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  btn: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  btnLabel: { fontSize: 12, fontWeight: '700', color: '#6366F1' },
  btnAmount: { fontSize: 11, color: '#6366F1', marginTop: 2 },
});
