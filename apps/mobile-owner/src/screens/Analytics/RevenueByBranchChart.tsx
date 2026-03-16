import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import BarChartWidget from '../../components/charts/BarChartWidget';
import { BranchRevenueItem } from '../../api/analytics.api';

interface RevenueByBranchChartProps {
  data: BranchRevenueItem[] | undefined;
}

export default function RevenueByBranchChart({ data }: RevenueByBranchChartProps) {
  const { t } = useTranslation();

  const chartData = data?.map((d) => ({ x: d.name, y: d.revenue }));

  return (
    <View style={styles.container}>
      <BarChartWidget data={chartData} title={t('analytics.revenueByBranch')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 4 },
});
