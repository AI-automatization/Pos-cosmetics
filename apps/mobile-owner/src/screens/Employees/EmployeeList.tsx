import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
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

export default function EmployeeList({ data, isRefreshing, onRefresh, onPressEmployee }: EmployeeListProps) {
  const { t } = useTranslation();
  return (
    <FlatList<EmployeePerformance>
      data={data}
      keyExtractor={(item) => item.employeeId}
      renderItem={({ item }) => (
        <EmployeeCard
          item={item}
          onPress={onPressEmployee ? () => onPressEmployee(item) : undefined}
        />
      )}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<EmptyState message={t('employees.emptyPerformance')} />}
      contentContainerStyle={{ paddingVertical: 8, paddingBottom: 32 }}
      scrollEnabled={false}
    />
  );
}
