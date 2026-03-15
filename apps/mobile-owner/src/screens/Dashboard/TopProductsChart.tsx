import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import HorizontalBarChart from '../../components/charts/HorizontalBarChart';
import { TopProduct } from '../../api/analytics.api';

interface TopProductsChartProps {
  data: TopProduct[] | undefined;
}

export default function TopProductsChart({ data }: TopProductsChartProps) {
  const { t } = useTranslation();

  const chartData = data?.map((d) => ({ label: d.name, value: d.revenue }));

  return (
    <View style={styles.container}>
      <HorizontalBarChart data={chartData} title={t('dashboard.topProducts')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 4 },
});
