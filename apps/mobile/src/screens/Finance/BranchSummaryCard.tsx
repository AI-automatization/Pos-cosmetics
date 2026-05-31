import React from 'react';
import { View, Text } from 'react-native';
import { styles, fmtUzs } from './BranchReportsScreen.styles';

interface BranchSummaryCardProps {
  readonly totalRevenue: number;
  readonly branchCount: number;
}

function BranchSummaryCard({ totalRevenue, branchCount }: BranchSummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>Jami tushum (barcha filiallar)</Text>
      <Text style={styles.summaryValue}>{fmtUzs(totalRevenue)}</Text>
      <Text style={styles.summaryMeta}>{branchCount} ta filial</Text>
    </View>
  );
}

export default React.memo(BranchSummaryCard);
