import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { EmployeePerformance } from '../../api/employees.api';
import EmployeeCard from './EmployeeCard';
import EmptyState from '../../components/common/EmptyState';

interface EmployeeListProps {
  data: EmployeePerformance[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onPressEmployee?: (item: EmployeePerformance) => void;
}

export default function EmployeeList({ data, onPressEmployee }: EmployeeListProps) {
  const { t } = useTranslation();
  if (data.length === 0) {
    return <EmptyState message={t('employees.emptyPerformance')} />;
  }
  return (
    <View style={styles.container}>
      {data.map((item) => (
        <EmployeeCard
          key={item.employeeId}
          item={item}
          onPress={onPressEmployee ? () => onPressEmployee(item) : undefined}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8, paddingBottom: 32 },
});
