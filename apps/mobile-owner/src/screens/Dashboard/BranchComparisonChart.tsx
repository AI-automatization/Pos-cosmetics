import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import BarChartWidget from '../../components/charts/BarChartWidget';
import { BranchComparisonItem } from '../../api/analytics.api';

interface BranchComparisonChartProps {
  data: BranchComparisonItem[] | undefined;
}

export default function BranchComparisonChart({ data }: BranchComparisonChartProps) {
  const { t } = useTranslation();

  const chartData = data?.map((d) => ({ x: d.branchName, y: d.revenue }));

  return (
    <View style={styles.container}>
      <BarChartWidget data={chartData} title={t('dashboard.branchComparison')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 4 },
});
