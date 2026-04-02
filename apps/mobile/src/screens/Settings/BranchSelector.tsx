import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import { SkeletonList } from '@/components/common/SkeletonLoader';
import ErrorView from '@/components/common/ErrorView';
import { branchApi } from '@/api';
import { useAppStore } from '@/store/app.store';
import type { Branch } from '@/api/branches.api';
import { QUERY_STALE_TIMES } from '@/config/constants';

type Props = {
  navigation: NativeStackNavigationProp<SettingsStackParamList, 'BranchSelector'>;
};

interface BranchRowProps {
  item: Branch;
  isSelected: boolean;
  onPress: () => void;
}

function BranchRow({ item, isSelected, onPress }: BranchRowProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.row, isSelected && styles.rowSelected]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
    >
      <View style={styles.rowContent}>
        <Text style={[styles.rowName, isSelected && styles.rowNameSelected]}>
          {item.name}
        </Text>
        {item.address ? (
          <Text style={styles.rowAddress}>{item.address}</Text>
        ) : null}
      </View>
      {isSelected && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

export default function BranchSelectorScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { selectedBranchId, setSelectedBranch } = useAppStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchApi.getAll(),
    staleTime: QUERY_STALE_TIMES.BRANCHES,
  });

  const handleSelect = (id: string | null): void => {
    setSelectedBranch(id);
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <ScreenLayout title={t('settings.branch')}>
        <SkeletonList count={4} />
      </ScreenLayout>
    );
  }

  if (error) {
    return <ErrorView error={error} onRetry={() => void refetch()} />;
  }

  return (
    <ScreenLayout title={t('settings.branch')}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <TouchableOpacity
            style={[styles.row, selectedBranchId === null && styles.rowSelected]}
            onPress={() => handleSelect(null)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedBranchId === null }}
          >
            <Text style={[styles.rowName, selectedBranchId === null && styles.rowNameSelected]}>
              🏢 {t('common.all')} {t('dashboard.branches')}
            </Text>
            {selectedBranchId === null && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <BranchRow
            item={item}
            isSelected={selectedBranchId === item.id}
            onPress={() => handleSelect(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        scrollEnabled={false}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 16,
  },
  row: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  rowSelected: {
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#1a56db',
  },
  rowContent: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  rowNameSelected: {
    color: '#1a56db',
    fontWeight: '700',
  },
  rowAddress: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: '#1a56db',
    fontWeight: '700',
  },
  separator: {
    height: 8,
  },
});
