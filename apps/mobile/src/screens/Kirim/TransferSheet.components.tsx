import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CatalogProduct } from '../../api/catalog.api';
import { C } from './KirimColors';
import { styles } from './TransferSheet.styles';

// ─── Types ───────────────────────────────────────────
export interface TransferLine {
  key: string;
  productId: string;
  productName: string;
  quantity: string;
}

export const EMPTY_LINE: Omit<TransferLine, 'key'> = {
  productId: '',
  productName: '',
  quantity: '1',
};

// ─── TransferItemRow ─────────────────────────────────
interface TransferItemRowProps {
  readonly item: TransferLine;
  readonly onRemove: (key: string) => void;
  readonly disabled: boolean;
}

export function TransferItemRow({ item, onRemove, disabled }: TransferItemRowProps) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
        <Text style={styles.itemQty}>{item.quantity} dona</Text>
      </View>
      <TouchableOpacity onPress={() => onRemove(item.key)} disabled={disabled}>
        <Ionicons name="close-circle" size={20} color={C.red} />
      </TouchableOpacity>
    </View>
  );
}

// ─── AddItemForm ─────────────────────────────────────
interface AddItemFormProps {
  readonly newLine: Omit<TransferLine, 'key'>;
  readonly productSearch: string;
  readonly filteredProducts: CatalogProduct[];
  readonly onChangeNewLine: (updater: (prev: Omit<TransferLine, 'key'>) => Omit<TransferLine, 'key'>) => void;
  readonly onProductSearchChange: (text: string) => void;
  readonly onSelectProduct: (product: CatalogProduct) => void;
  readonly onAdd: () => void;
  readonly onCancel: () => void;
}

export function AddItemForm({
  newLine,
  productSearch,
  filteredProducts,
  onChangeNewLine,
  onProductSearchChange,
  onSelectProduct,
  onAdd,
  onCancel,
}: AddItemFormProps) {
  return (
    <View style={styles.addForm}>
      <Text style={styles.addFormTitle}>Mahsulot qo'shish</Text>

      {newLine.productId ? (
        <View style={styles.selectedProduct}>
          <Text style={styles.selectedProductName} numberOfLines={1}>{newLine.productName}</Text>
          <TouchableOpacity onPress={() => onChangeNewLine(() => EMPTY_LINE)}>
            <Ionicons name="close-circle" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={productSearch}
            onChangeText={onProductSearchChange}
            placeholder="Mahsulot nomi yoki SKU..."
            placeholderTextColor={C.muted}
            autoFocus
          />
          {filteredProducts.length > 0 && (
            <FlatList
              data={filteredProducts}
              keyExtractor={(p) => p.id}
              scrollEnabled={false}
              renderItem={({ item: p }) => (
                <TouchableOpacity
                  style={styles.productSuggestion}
                  onPress={() => onSelectProduct(p)}
                >
                  <Text style={styles.productSuggestionName}>{p.name}</Text>
                  <Text style={styles.productSuggestionSku}>{p.sku}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}

      <Text style={[styles.label, styles.labelMarginTopSm]}>Miqdor</Text>
      <TextInput
        style={styles.input}
        value={newLine.quantity}
        onChangeText={(v) => onChangeNewLine((prev) => ({ ...prev, quantity: v }))}
        placeholder="1"
        placeholderTextColor={C.muted}
        keyboardType="numeric"
      />

      <View style={styles.addFormBtns}>
        <TouchableOpacity style={styles.cancelSmallBtn} onPress={onCancel}>
          <Text style={styles.cancelSmallBtnText}>Bekor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addSmallBtn} onPress={onAdd}>
          <Text style={styles.addSmallBtnText}>Qo'shish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
