// apps/mobile/src/screens/Kirim/components/ManualItemMiniForm.tsx

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './types';
import type { LineItem } from './types';
import type { CatalogProduct } from '../../../api/catalog.api';

interface ManualItemMiniFormProps {
  readonly manualLine: Omit<LineItem, 'key'>;
  readonly onChangeField: (
    key: keyof Omit<LineItem, 'key'>,
  ) => (value: string) => void;
  readonly catalogProducts: CatalogProduct[];
  readonly filteredProducts: CatalogProduct[];
  readonly productSearch: string;
  readonly onProductSearch: (val: string) => void;
  readonly onSelectProduct: (product: CatalogProduct) => void;
  readonly onClearProduct: () => void;
  readonly onAdd: () => void;
  readonly onCancel: () => void;
}

export default function ManualItemMiniForm({
  manualLine,
  onChangeField,
  catalogProducts: _catalogProducts,
  filteredProducts,
  productSearch,
  onProductSearch,
  onSelectProduct,
  onClearProduct,
  onAdd,
  onCancel,
}: ManualItemMiniFormProps) {
  return (
    <View style={styles.miniForm}>
      <Text style={styles.miniFormTitle}>Qo'lda kiritish</Text>

      <Text style={styles.label}>Mahsulot *</Text>
      {manualLine.productId ? (
        <View style={styles.selectedProductRow}>
          <Text style={styles.selectedProductName} numberOfLines={1}>
            {manualLine.productName}
          </Text>
          <TouchableOpacity onPress={onClearProduct}>
            <Ionicons name="close-circle" size={20} color={C.muted} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={productSearch}
            onChangeText={onProductSearch}
            placeholder="Mahsulot nomini kiriting..."
            placeholderTextColor={C.muted}
            returnKeyType="search"
          />
          {filteredProducts.length > 0 && (
            <View style={styles.productDropdown}>
              {filteredProducts.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.productDropdownItem}
                  onPress={() => onSelectProduct(p)}
                >
                  <Text style={styles.productDropdownName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.productDropdownPrice}>
                    {p.costPrice.toLocaleString('ru-RU')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}

      <Text style={styles.label}>Miqdor (dona) *</Text>
      <TextInput
        style={styles.input}
        value={manualLine.quantity}
        onChangeText={onChangeField('quantity')}
        placeholder="0"
        placeholderTextColor={C.muted}
        keyboardType="numeric"
        returnKeyType="next"
      />

      <Text style={styles.label}>Kelish narxi (UZS) *</Text>
      <TextInput
        style={styles.input}
        value={manualLine.costPrice}
        onChangeText={onChangeField('costPrice')}
        placeholder="0"
        placeholderTextColor={C.muted}
        keyboardType="numeric"
        returnKeyType="next"
      />

      <Text style={styles.label}>Muddati (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={manualLine.expiryDate}
        onChangeText={onChangeField('expiryDate')}
        placeholder="2027-12-31"
        placeholderTextColor={C.muted}
        returnKeyType="done"
      />

      <View style={styles.miniFormActions}>
        <TouchableOpacity style={styles.miniCancelBtn} onPress={onCancel}>
          <Text style={styles.miniCancelBtnText}>Bekor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.miniAddBtn} onPress={onAdd}>
          <Text style={styles.miniAddBtnText}>Qo'shish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  miniForm: {
    marginTop: 12,
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  miniFormTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: C.bg,
  },
  selectedProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.bg,
    justifyContent: 'space-between',
  },
  selectedProductName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  productDropdown: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 4,
    backgroundColor: C.white,
  },
  productDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDropdownName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  productDropdownPrice: {
    fontSize: 12,
    color: C.secondary,
    marginLeft: 8,
  },
  miniFormActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  miniCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  miniCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.secondary,
  },
  miniAddBtn: {
    flex: 2,
    backgroundColor: C.green,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  miniAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },
});
