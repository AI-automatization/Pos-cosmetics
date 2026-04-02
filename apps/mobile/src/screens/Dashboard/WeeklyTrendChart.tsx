import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DailyRevenue } from '@raos/types';
import Card from '../../components/common/Card';
import { formatCompact } from '../../utils/currency';

interface WeeklyTrendChartProps {
  readonly data: DailyRevenue[];
}

const BAR_MAX_HEIGHT = 72;
const DAY_LABELS = ['Yak', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

function buildPlaceholderDays(): DailyRevenue[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const date = d.toISOString().split('T')[0] ?? d.toISOString().substring(0, 10);
    return { date, revenue: 0, orderCount: 0 };
  });
}

export default function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const { t } = useTranslation();

  const chartData = data.length > 0 ? data : buildPlaceholderDays();
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  return (
    <Card>
      <Text style={styles.label}>{t('dashboard.weeklyTrend')}</Text>
      <View style={styles.chart}>
        {chartData.map((item) => {
          const isEmpty = data.length === 0;
          const barHeight = isEmpty
            ? 4
            : Math.max((item.revenue / maxRevenue) * BAR_MAX_HEIGHT, 4);
          const dayOfWeek = new Date(item.date).getDay();
          const isToday =
            item.date === new Date().toISOString().split('T')[0];

          return (
            <View key={item.date} style={styles.barWrapper}>
              <Text style={styles.barValue}>
                {item.revenue > 0 ? formatCompact(item.revenue) : ''}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { height: barHeight },
                    isToday && styles.barToday,
                  ]}
                />
              </View>
              <Text style={[styles.barDay, isToday && styles.barDayToday]}>
                {DAY_LABELS[dayOfWeek]}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 48,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  barTrack: {
    width: '60%',
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: '#C7D2FE',
    borderRadius: 4,
  },
  barToday: {
    backgroundColor: '#6366F1',
  },
  barDay: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  barDayToday: {
    color: '#6366F1',
    fontWeight: '700',
  },
});
