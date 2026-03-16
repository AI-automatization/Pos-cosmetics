import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface BarChartItem {
  readonly label: string;
  readonly value: number;
}

interface BarChartProps {
  readonly data: BarChartItem[];
  readonly color?: string;
  readonly formatValue?: (value: number) => string;
  readonly maxHeight?: number;
}

export default function BarChart({
  data,
  color = '#1a56db',
  formatValue,
  maxHeight = 120,
}: BarChartProps): React.JSX.Element {
  if (!data || data.length === 0) {
    return <View />;
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      {data.map((item) => {
        const barHeight = (item.value / maxValue) * maxHeight;
        return (
          <View key={item.label} style={styles.column}>
            <Text style={styles.value} numberOfLines={1}>
              {formatValue ? formatValue(item.value) : String(item.value)}
            </Text>
            <View
              style={[
                styles.bar,
                { height: Math.max(barHeight, 4), backgroundColor: color },
              ]}
            />
            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingTop: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  value: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  label: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
