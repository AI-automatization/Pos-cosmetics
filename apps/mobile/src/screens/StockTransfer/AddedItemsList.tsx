// AddedItemsList.tsx — qo'shilgan mahsulotlar ro'yxati

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './StockTransferColors';
import type { TransferItem } from './StockTransferTypes';
import { styles } from './NewTransferSheet.styles';

interface AddedItem extends TransferItem {
  key: string;
}

interface AddedItemsListProps {
  readonly items: readonly AddedItem[];
  readonly qtyInputMap: Readonly<Record<string, string>>;
  readonly onQtyChange: (key: string, text: string) => void;
  readonly onRemove: (key: string) => void;
  readonly disabled: boolean;
}

function AddedItemRow({
  item,
  qtyValue,
  onQtyChange,
  onRemove,
  disabled,
}: {
  readonly item: AddedItem;
  readonly qtyValue: string;
  readonly onQtyChange: (key: string, text: string) => void;
  readonly onRemove: (key: string) => void;
  readonly disabled: boolean;
}) {
  return (
    <View style={styles.addedItemRow}>
      <View style={styles.addedItemInfo}>
        <Text style={styles.addedItemName} numberOfLines={1}>
          {item.productName}
        </Text>
        <Text style={styles.addedItemMeta}>
          {item.warehouseName} · Maks: {item.availableQty} dona
        </Text>
      </View>
      <TextInput
        style={styles.qtyInput}
        value={qtyValue}
        onChangeText={(t) => onQtyChange(item.key, t)}
        keyboardType="numeric"
        placeholder="Miqdor"
        placeholderTextColor={C.muted}
        editable={!disabled}
        returnKeyType="done"
        selectTextOnFocus
      />
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => onRemove(item.key)}
        disabled={disabled}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close-circle" size={20} color={C.red} />
      </TouchableOpacity>
    </View>
  );
}

export default function AddedItemsList({
  items,
  qtyInputMap,
  onQtyChange,
  onRemove,
  disabled,
}: AddedItemsListProps) {
  if (items.length === 0) return null;

  return (
    <>
      <Text style={[styles.label, styles.labelTop]}>
        Tanlangan mahsulotlar ({items.length}):
      </Text>
      {items.map((item) => (
        <AddedItemRow
          key={item.key}
          item={item}
          qtyValue={qtyInputMap[item.key] ?? ''}
          onQtyChange={onQtyChange}
          onRemove={onRemove}
          disabled={disabled}
        />
      ))}
    </>
  );
}
