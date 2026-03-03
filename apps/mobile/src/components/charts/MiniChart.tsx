import React from 'react';
import { View, StyleSheet } from 'react-native';

interface MiniChartProps {
  readonly data: number[];
  readonly color?: string;
  readonly height?: number;
}

export default function MiniChart({
  data,
  color = '#1a56db',
  height = 40,
}: MiniChartProps): React.JSX.Element {
  if (!data || data.length === 0) {
    return <View style={[styles.container, { height }]} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return (
    <View style={[styles.container, { height }]}>
      {data.map((value, index) => {
        const barHeight = ((value - min) / range) * height;
        const isLast = index === data.length - 1;
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: Math.max(barHeight, 2),
                backgroundColor: isLast ? color : `${color}66`,
                flex: 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    borderRadius: 2,
    minHeight: 2,
  },
});
