import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, Radii, Shadows } from '../../config/theme';

export interface LineDataPoint {
  x: string;
  y: number;
}

interface LineChartWidgetProps {
  data?: LineDataPoint[];
  title?: string;
  height?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_H = 110;
const PAD = { top: 8, bottom: 4, left: 4, right: 4 };

// 30-day mock trend (realistic UZS values)
const MOCK_DATA: LineDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  x: `D${i + 1}`,
  y: 14_000_000 + Math.sin(i * 0.4 + 1) * 4_000_000 + (i % 7 === 6 ? 3_000_000 : 0),
}));

function buildPaths(
  pts: LineDataPoint[],
  w: number,
  h: number,
): { line: string; area: string } {
  if (pts.length < 2) return { line: '', area: '' };
  const ys = pts.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeY = maxY - minY || 1;
  const innerW = w - PAD.left - PAD.right;
  const innerH = h - PAD.top - PAD.bottom;

  const coords = pts.map((p, i) => ({
    x: PAD.left + (i / (pts.length - 1)) * innerW,
    y: PAD.top + innerH - ((p.y - minY) / rangeY) * innerH,
  }));

  let line = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpX = ((prev.x + curr.x) / 2).toFixed(1);
    line += ` C ${cpX} ${prev.y.toFixed(1)} ${cpX} ${curr.y.toFixed(1)} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }

  const bottomY = (PAD.top + innerH).toFixed(1);
  const area = `${line} L ${coords[coords.length - 1].x.toFixed(1)} ${bottomY} L ${PAD.left.toFixed(1)} ${bottomY} Z`;

  return { line, area };
}

export default function LineChartWidget({ data, title, height = 160 }: LineChartWidgetProps) {
  const displayData = data && data.length >= 2 ? data : MOCK_DATA;
  const chartWidth = SCREEN_WIDTH - 64;
  const { line, area } = buildPaths(displayData, chartWidth, CHART_H);

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
      <Svg width={chartWidth} height={CHART_H}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity={0.0} />
          </LinearGradient>
        </Defs>
        {area ? <Path d={area} fill="url(#grad)" /> : null}
        {line ? (
          <Path d={line} fill="none" stroke={Colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 10,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
