import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import LineChartWidget from '../../components/charts/LineChartWidget';
import { SalesTrendPoint } from '../../api/analytics.api';

interface SalesTrendChartProps {
  data: SalesTrendPoint[] | undefined;
}

export default function SalesTrendChart({ data }: SalesTrendChartProps) {
  const { t } = useTranslation();

  const chartData = data?.map((d) => ({ x: d.date, y: d.revenue }));

  return (
    <View style={styles.container}>
      <LineChartWidget data={chartData} title={t('dashboard.salesTrend')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 4 },
});
