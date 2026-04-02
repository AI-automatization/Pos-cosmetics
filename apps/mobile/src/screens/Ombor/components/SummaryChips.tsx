import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { C } from './types';

interface SummaryChipsProps {
  total: number;
  kamCount: number;
  tugadiCount: number;
}

export default function SummaryChips({ total, kamCount, tugadiCount }: SummaryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
    >
      <View style={styles.chipTotal}>
        <MaterialCommunityIcons name="clipboard-list-outline" size={14} color={C.primary} />
        <Text style={styles.chipTotalText}>{total} ta mahsulot</Text>
      </View>

      <View style={styles.chipKam}>
        <Ionicons name="warning-outline" size={14} color={C.orange} />
        <Text style={styles.chipKamText}>{kamCount} ta kam</Text>
      </View>

      <View style={styles.chipTugadi}>
        <Ionicons name="alert-circle-outline" size={14} color={C.red} />
        <Text style={styles.chipTugadiText}>{tugadiCount} ta tugadi</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipsRow: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  chipTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
  chipTotalText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
  },
  chipKam: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
  },
  chipKamText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.orange,
  },
  chipTugadi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
  },
  chipTugadiText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.red,
  },
});
