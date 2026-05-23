import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from './SalesColors';

interface SalesShiftCardProps {
  readonly cashierName: string;
  readonly startTime: string;
}

export default function SalesShiftCard({ cashierName, startTime }: SalesShiftCardProps) {
  return (
    <View style={styles.shiftCard}>
      <View style={styles.shiftLeft}>
        <View style={styles.shiftDot} />
        <View>
          <Text style={styles.shiftCashier}>Faol smena: {cashierName}</Text>
          <Text style={styles.shiftTime}>Boshlanish vaqti: {startTime}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shiftCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: C.green,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  shiftLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  shiftDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.green,
  },
  shiftCashier: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  shiftTime: {
    fontSize: 12,
    color: C.secondary,
    marginTop: 2,
  },
});
