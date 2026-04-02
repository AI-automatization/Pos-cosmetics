import React, { useMemo } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '../../api/inventory.api';
import WarehouseItemRow from './WarehouseItemRow';
import EmptyState from '../../components/common/EmptyState';

interface Props {
  items: InventoryItem[];
  search: string;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function WarehouseList({ items, search, isRefreshing, onRefresh }: Props) {
  const { t } = useTranslation();

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (i) =>
        i.productName.toLowerCase().includes(q) ||
        i.barcode.toLowerCase().includes(q),
    );
  }, [items, search]);

  return (
    <FlatList<InventoryItem>
      data={filtered}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <WarehouseItemRow item={item} />}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <EmptyState
          message={
            search.trim()
              ? t('warehouse.noSearchResults', 'Natija topilmadi')
              : t('warehouse.emptyList', 'Tovarlar yo\'q')
          }
        />
      }
    />
  );
}
