import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '../../api/inventory.api';
import InventoryItemRow from './InventoryItemRow';
import EmptyState from '../../components/common/EmptyState';
import { InventoryTabStatus } from '../../hooks/useInventory';

interface InventoryListProps {
  items: InventoryItem[];
  isRefreshing: boolean;
  onRefresh: () => void;
  status: InventoryTabStatus;
}

const EMPTY_MESSAGES: Record<InventoryTabStatus, string> = {
  all: 'inventory.emptyAll',
  normal: 'inventory.emptyAll',
  low: 'inventory.emptyLow',
  out_of_stock: 'inventory.emptyOut',
  expiring: 'inventory.emptyExpiring',
  expired: 'inventory.emptyExpired',
};

export default function InventoryList({ items, isRefreshing, onRefresh, status }: InventoryListProps) {
  const { t } = useTranslation();

  return (
    <FlatList<InventoryItem>
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <InventoryItemRow item={item} />}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<EmptyState message={t(EMPTY_MESSAGES[status])} />}
    />
  );
}
