import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../config/theme';

interface ChartNoDataProps {
  /** Optional fixed height so the no-data state occupies the chart area. */
  height?: number;
}

/**
 * Centered "no data" placeholder shown by chart widgets when there is
 * nothing real to render. Replaces the old mock-bar fallbacks so the owner
 * never sees fabricated financial figures on empty/error states.
 */
export default function ChartNoData({ height }: ChartNoDataProps) {
  return (
    <View style={[styles.container, height != null && { height }]}>
      <Text style={styles.text}>Ma'lumot yo'q</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
