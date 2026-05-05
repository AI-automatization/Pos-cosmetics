import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import type { Order } from '@raos/types';
import { Colors } from '../../config/theme';
import SalesOrderRow from './SalesOrderRow';
import EmptyState from '../../components/common/EmptyState';

interface SalesOrderListProps {
  readonly data: Order[];
  readonly isRefreshing: boolean;
  readonly onRefresh: () => void;
  readonly onPress: (orderId: string, orderNumber: number) => void;
}

export default function SalesOrderList({
  data,
  isRefreshing,
  onRefresh,
  onPress,
}: SalesOrderListProps) {
  const renderItem = React.useCallback(
    ({ item }: { item: Order }) => (
      <SalesOrderRow item={item} onPress={onPress} />
    ),
    [onPress],
  );

  const keyExtractor = React.useCallback((item: Order) => item.id, []);

  return (
    <FlatList<Order>
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
      ListEmptyComponent={<EmptyState title="Buyurtmalar topilmadi" />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 8,
    flexGrow: 1,
  },
});
