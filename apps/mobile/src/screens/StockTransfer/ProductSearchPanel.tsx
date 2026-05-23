// ProductSearchPanel.tsx — mahsulot qidirish va tanlash paneli

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './StockTransferColors';
import type { StockLevel } from './StockTransferTypes';
import { styles } from './NewTransferSheet.styles';

interface ProductSearchPanelProps {
  readonly productSearch: string;
  readonly onSearchChange: (text: string) => void;
  readonly onClose: () => void;
  readonly isLoading: boolean;
  readonly availableProducts: readonly StockLevel[];
  readonly addedKeys: ReadonlySet<string>;
  readonly onAddProduct: (item: StockLevel) => void;
}

function ProductSearchResultItem({
  item,
  alreadyAdded,
  onAdd,
}: {
  readonly item: StockLevel;
  readonly alreadyAdded: boolean;
  readonly onAdd: (item: StockLevel) => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.searchResultRow,
        alreadyAdded && styles.searchResultRowAdded,
      ]}
      onPress={() => onAdd(item)}
      disabled={alreadyAdded}
      activeOpacity={0.75}
    >
      <View style={styles.searchResultInfo}>
        <Text style={styles.searchResultName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.searchResultMeta}>
          {item.warehouseName} ·{' '}
          {item.totalQty % 1 === 0
            ? String(item.totalQty)
            : item.totalQty.toFixed(2)}{' '}
          dona
        </Text>
      </View>
      {alreadyAdded ? (
        <Ionicons name="checkmark-circle" size={20} color={C.green} />
      ) : (
        <Ionicons name="add-circle-outline" size={20} color={C.primary} />
      )}
    </TouchableOpacity>
  );
}

const SearchSeparator = () => <View style={styles.searchSeparator} />;

export default function ProductSearchPanel({
  productSearch,
  onSearchChange,
  onClose,
  isLoading,
  availableProducts,
  addedKeys,
  onAddProduct,
}: ProductSearchPanelProps) {
  return (
    <View style={styles.searchPanel}>
      <View style={styles.searchInputRow}>
        <Ionicons name="search-outline" size={16} color={C.muted} />
        <TextInput
          style={styles.searchInput}
          value={productSearch}
          onChangeText={onSearchChange}
          placeholder="Mahsulot nomini kiriting..."
          placeholderTextColor={C.muted}
          autoFocus
          returnKeyType="search"
        />
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color={C.secondary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={C.primary}
          style={styles.branchLoader}
        />
      ) : availableProducts.length === 0 ? (
        <View style={styles.searchEmpty}>
          <Text style={styles.searchEmptyText}>Mahsulot topilmadi</Text>
        </View>
      ) : (
        <FlatList
          data={availableProducts}
          keyExtractor={(i) => `${i.productId}-${i.warehouseId}`}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const key = `${item.productId}-${item.warehouseId}`;
            return (
              <ProductSearchResultItem
                item={item}
                alreadyAdded={addedKeys.has(key)}
                onAdd={onAddProduct}
              />
            );
          }}
          ItemSeparatorComponent={SearchSeparator}
        />
      )}
    </View>
  );
}
