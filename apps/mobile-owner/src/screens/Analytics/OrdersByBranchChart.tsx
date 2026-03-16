import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import BarChartWidget from '../../components/charts/BarChartWidget';
import { BranchRevenueItem } from '../../api/analytics.api';

interface OrdersByBranchChartProps {
  data: BranchRevenueItem[] | undefined;
}

const MOCK_ORDERS = [
  { x: 'Chilonzor', y: 247 },
  { x: 'Yunusabad', y: 198 },
  { x: "Mirzo Ulug'bek", y: 156 },
  { x: 'Sergeli', y: 104 },
];

export default function OrdersByBranchChart({ data }: OrdersByBranchChartProps) {
  const { t } = useTranslation();

  const chartData = data?.map((d) => ({ x: d.name, y: d.orders }));

  return (
    <View style={styles.container}>
      <BarChartWidget
        data={chartData}
        mockData={MOCK_ORDERS}
        title={t('analytics.ordersByBranch')}
        valueFormatter={(v) => `${v} ta`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 4 },
});
