import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatCurrency';
import { StockValueData } from '../../api/inventory.api';
import BarChartWidget from '../../components/charts/BarChartWidget';

interface StockValueByBranchProps {
  data: StockValueData | undefined;
}

const MOCK_STOCK = [
  { x: 'Chilonzor', y: 68_400_000 },
  { x: 'Yunusabad', y: 52_700_000 },
  { x: "Mirzo Ulug'bek", y: 41_200_000 },
  { x: 'Sergeli', y: 28_600_000 },
];

export default function StockValueByBranch({ data }: StockValueByBranchProps) {
  const { t } = useTranslation();

  const chartData = data?.byBranch.map((b) => ({ x: b.branchName, y: b.value }));

  return (
    <View style={styles.container}>
      <BarChartWidget
        data={chartData}
        mockData={MOCK_STOCK}
        title={t('analytics.stockValueByBranch')}
        valueFormatter={formatCurrency}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 4 },
});
