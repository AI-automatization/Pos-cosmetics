import React, { useState } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import ErrorView from '@/components/common/ErrorView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useDebtors } from '@/hooks/useNasiya';
import { useAppStore } from '@/store/app.store';
import { formatCurrency } from '@/utils/format';
import type { NasiyaStackParamList } from '@/navigation/types';
import type { Debtor } from '@/api/nasiya.api';

type NavProp = NativeStackNavigationProp<NasiyaStackParamList, 'DebtorsList'>;

function DebtorRow({ item, onPress }: { item: Debtor; onPress: () => void }): React.JSX.Element {
  const { t } = useTranslation();
  const isOverdue = item.overdueAmount > 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.debtorRow}>
        <View style={styles.debtorInfo}>
          <Text style={styles.debtorName}>{item.customerName}</Text>
          <Text style={styles.debtorPhone}>{item.customerPhone}</Text>
          <Text style={styles.debtorBranch}>{item.branchName}</Text>
        </View>
        <View style={styles.debtorRight}>
          <Text style={[styles.debtAmount, isOverdue && styles.debtAmountOverdue]}>
            {formatCurrency(item.totalDebt, item.currency)}
          </Text>
          {isOverdue && (
            <Badge
              label={t('nasiya.overdue')}
              variant="error"
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DebtorsListScreen(): React.JSX.Element {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { selectedBranchId } = useAppStore();
  const { data, isLoading, error, refetch } = useDebtors(selectedBranchId ?? undefined);
  const [search, setSearch] = useState('');

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorView error={error} onRetry={refetch} />;

  const filtered = data?.filter((d) =>
    d.customerName.toLowerCase().includes(search.toLowerCase()) ||
    d.customerPhone.includes(search),
  ) ?? [];

  const totalDebt = filtered.reduce((sum, d) => sum + d.totalDebt, 0);
  const currency = filtered[0]?.currency ?? 'UZS';

  return (
    <ScreenLayout title={t('nasiya.title')} onRefresh={refetch} isRefreshing={isLoading}>
      {/* Summary */}
      <Card>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{filtered.length}</Text>
            <Text style={styles.summaryLabel}>{t('nasiya.debtors')}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, styles.summaryDebt]}>
              {formatCurrency(totalDebt, currency)}
            </Text>
            <Text style={styles.summaryLabel}>{t('nasiya.totalDebt')}</Text>
          </View>
        </View>
      </Card>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('nasiya.searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState message={search ? t('nasiya.noSearchResults') : t('nasiya.noDebtors')} />
      ) : (
        <Card>
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DebtorRow
                item={item}
                onPress={() => navigation.navigate('DebtDetail', { debtorId: item.id, customerName: item.customerName })}
              />
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Card>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  debtorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  debtorInfo: {
    flex: 1,
  },
  debtorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  debtorPhone: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  debtorBranch: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  debtorRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  debtAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  debtAmountOverdue: {
    color: '#dc2626',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  summaryDebt: {
    color: '#dc2626',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
});
