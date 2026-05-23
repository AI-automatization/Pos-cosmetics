import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import AgingBucketChart from '../../components/charts/AgingBucketChart';
import { AgingReport } from '../../api/debts.api';

interface AgingReportChartProps {
  data: AgingReport | undefined;
}

export default function AgingReportChart({ data }: AgingReportChartProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('debts.agingReport')}</Text>
      <AgingBucketChart buckets={data?.buckets} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginTop: 4 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
});
