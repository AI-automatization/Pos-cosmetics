import React from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomerDebt } from '../../api/debts.api';
import CustomerDebtRow from './CustomerDebtRow';
import EmptyState from '../../components/common/EmptyState';
import { Colors } from '../../config/theme';

interface CustomerDebtListProps {
  data: CustomerDebt[];
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function CustomerDebtList({ data, isRefreshing, onRefresh }: CustomerDebtListProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('debts.customerList')}</Text>
      <FlatList<CustomerDebt>
        data={data}
        scrollEnabled={false}
        keyExtractor={(item) => item.customerId}
        renderItem={({ item }) => <CustomerDebtRow item={item} />}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState message={t('debts.emptyCustomers')} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
