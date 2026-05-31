import React from 'react';
import { Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from './Alerts.styles';

export type FilterKey = 'all' | 'unread' | 'important';

interface FilterPillsProps {
  readonly activeFilter: FilterKey;
  readonly onSelect: (key: FilterKey) => void;
  readonly labels: Record<FilterKey, string>;
}

const FILTERS: FilterKey[] = ['all', 'unread', 'important'];

export default function FilterPills({ activeFilter, onSelect, labels }: FilterPillsProps): React.JSX.Element {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pillsContainer}
    >
      {FILTERS.map((key) => (
        <TouchableOpacity
          key={key}
          style={[styles.pill, activeFilter === key && styles.pillActive]}
          onPress={() => onSelect(key)}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Text style={[styles.pillText, activeFilter === key && styles.pillTextActive]}>
            {labels[key]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
