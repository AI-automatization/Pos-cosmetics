import React from 'react';
import { Text, View } from 'react-native';

import { styles } from './ReportBuilderScreen.styles';

// ─── TableHeader ─────────────────────────────────────────
export function TableHeader({ cols }: { readonly cols: string[] }) {
  return (
    <View style={styles.tableHead}>
      {cols.map((col) => (
        <Text key={col} style={styles.tableHeadCell} numberOfLines={1}>
          {col}
        </Text>
      ))}
    </View>
  );
}

// ─── TableFooter ─────────────────────────────────────────
export function TableFooter({ cols }: { readonly cols: string[] }) {
  return (
    <View style={styles.tableFoot}>
      {cols.map((col, i) => (
        <Text key={i} style={styles.tableFootCell} numberOfLines={1}>
          {col}
        </Text>
      ))}
    </View>
  );
}
