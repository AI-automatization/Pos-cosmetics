import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryPie, VictoryTheme } from 'victory-native';

interface PieDataItem {
  x: string;
  y: number;
  color: string;
}

interface PieChartWidgetProps {
  data: PieDataItem[];
  title?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PieChartWidget({ data, title }: PieChartWidgetProps) {
  if (!data || data.length === 0) return null;

  const colorScale = data.map((d) => d.color);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <VictoryPie
        data={data}
        theme={VictoryTheme.material}
        width={SCREEN_WIDTH - 64}
        height={220}
        colorScale={colorScale}
        style={{
          labels: { fontSize: 10, fill: '#374151' },
        }}
        innerRadius={50}
        labelRadius={80}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingTop: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
});
