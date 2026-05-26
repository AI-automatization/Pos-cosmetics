import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Shift } from '../../api/shifts.api';
import ShiftRow from './ShiftRow';
import EmptyState from '../../components/common/EmptyState';

interface ShiftListProps {
  data: Shift[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onPressShift: (shiftId: string) => void;
}

export default function ShiftList({ data, isRefreshing, onRefresh, onPressShift }: ShiftListProps) {
  const { t } = useTranslation();
  return (
    <FlatList<Shift>
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ShiftRow item={item} onPress={onPressShift} />}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<EmptyState message={t('shifts.emptyShifts')} />}
    />
  );
}
