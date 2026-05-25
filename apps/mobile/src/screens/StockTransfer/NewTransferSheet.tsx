// NewTransferSheet.tsx — yangi o'tkazma modal komponenti

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UseMutationResult } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { C } from './StockTransferColors';
import type { StockLevel } from './StockTransferTypes';
import type { Branch } from '../../api/branches.api';
import type { CreateTransferBody, CreateTransferResponse } from '../../api/inventory.api';
import { styles } from './NewTransferSheet.styles';
import ProductSearchPanel from './ProductSearchPanel';
import AddedItemsList from './AddedItemsList';
import BranchChipSelector from './BranchChipSelector';
import TransferActions from './TransferActions';
import {
  type AddedItem,
  validateTransferForm,
  buildTransferPayload,
  handleTransferError,
} from './new-transfer.utils';

interface NewTransferSheetProps {
  readonly visible:          boolean;
  readonly onClose:          () => void;
  readonly onSuccess:        () => void;
  readonly stockLevels:      UseQueryResult<StockLevel[]>;
  readonly branches:         UseQueryResult<Branch[]>;
  readonly createTransfer:   UseMutationResult<CreateTransferResponse, Error, CreateTransferBody>;
  readonly selectedProduct?: StockLevel | null;
}

export default function NewTransferSheet({
  visible,
  onClose,
  onSuccess,
  stockLevels,
  branches,
  createTransfer,
  selectedProduct,
}: NewTransferSheetProps) {
  const [fromBranchId,      setFromBranchId]      = useState('');
  const [toBranchId,        setToBranchId]         = useState('');
  const [addedItems,        setAddedItems]         = useState<AddedItem[]>([]);
  const [notes,             setNotes]              = useState('');
  const [productSearchOpen, setProductSearchOpen]  = useState(false);
  const [productSearch,     setProductSearch]      = useState('');
  const [qtyInputMap,       setQtyInputMap]        = useState<Record<string, string>>({});

  const loading = createTransfer.isPending;

  const resetForm = useCallback(() => {
    setFromBranchId('');
    setToBranchId('');
    setAddedItems([]);
    setNotes('');
    setProductSearchOpen(false);
    setProductSearch('');
    setQtyInputMap({});
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Pre-fill selected product when sheet opens
  useEffect(() => {
    if (visible && selectedProduct && selectedProduct.totalQty > 0) {
      const key = `${selectedProduct.productId}-${selectedProduct.warehouseId}`;
      setAddedItems([{
        key,
        productId:     selectedProduct.productId,
        productName:   selectedProduct.name,
        quantity:       1,
        warehouseId:   selectedProduct.warehouseId,
        warehouseName: selectedProduct.warehouseName,
        availableQty:  selectedProduct.totalQty,
      }]);
      setQtyInputMap({ [key]: '1' });
    }
  }, [visible, selectedProduct]);

  // Qidiruv bo'yicha filterlangan va mavjud mahsulotlar
  const availableProducts = useMemo<StockLevel[]>(() => {
    const all = stockLevels.data ?? [];
    const q   = productSearch.toLowerCase().trim();
    const withQty = all.filter((i) => i.totalQty > 0);
    if (!q) return withQty;
    return withQty.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.warehouseName.toLowerCase().includes(q),
    );
  }, [stockLevels.data, productSearch]);

  // Set of added item keys for fast lookup
  const addedKeys = useMemo(
    () => new Set(addedItems.map((a) => a.key)),
    [addedItems],
  );

  const handleAddProduct = useCallback(
    (item: StockLevel) => {
      const key = `${item.productId}-${item.warehouseId}`;
      if (addedKeys.has(key)) {
        setProductSearchOpen(false);
        setProductSearch('');
        return;
      }
      const newItem: AddedItem = {
        key,
        productId:    item.productId,
        productName:  item.name,
        quantity:     1,
        warehouseId:  item.warehouseId,
        warehouseName: item.warehouseName,
        availableQty: item.totalQty,
      };
      setAddedItems((prev) => [...prev, newItem]);
      setQtyInputMap((prev) => ({ ...prev, [key]: '1' }));
      setProductSearchOpen(false);
      setProductSearch('');
    },
    [addedKeys],
  );

  const handleRemoveItem = useCallback((key: string) => {
    setAddedItems((prev) => prev.filter((i) => i.key !== key));
    setQtyInputMap((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleQtyChange = useCallback((key: string, text: string) => {
    setQtyInputMap((prev) => ({ ...prev, [key]: text }));
    const parsed = parseFloat(text.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      setAddedItems((prev) =>
        prev.map((i) => (i.key === key ? { ...i, quantity: parsed } : i)),
      );
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateTransferForm(fromBranchId, toBranchId, addedItems, qtyInputMap)) return;

    const payload = buildTransferPayload(fromBranchId, toBranchId, addedItems, notes);
    try {
      await createTransfer.mutateAsync(payload);
      resetForm();
      onSuccess();
    } catch (err) {
      handleTransferError(err);
    }
  }, [fromBranchId, toBranchId, addedItems, qtyInputMap, notes, createTransfer, resetForm, onSuccess]);

  const branchList = branches.data ?? [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            {/* Sarlavha */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>Yangi o'tkazma</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleClose}
                disabled={loading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color={C.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.scroll}
            >
              {/* Qaydan filiali */}
              <BranchChipSelector
                label="Qaydan:"
                branches={branchList}
                isLoading={branches.isLoading}
                selectedId={fromBranchId}
                onSelect={setFromBranchId}
                disabled={loading}
              />

              {/* Qayerga filiali */}
              <BranchChipSelector
                label="Qayga:"
                branches={branchList}
                isLoading={branches.isLoading}
                selectedId={toBranchId}
                onSelect={setToBranchId}
                disabled={loading}
                disabledId={fromBranchId}
                showTopMargin
              />

              {/* Qo'shilgan mahsulotlar */}
              <AddedItemsList
                items={addedItems}
                qtyInputMap={qtyInputMap}
                onQtyChange={handleQtyChange}
                onRemove={handleRemoveItem}
                disabled={loading}
              />

              {/* Mahsulot qo'shish tugmasi */}
              <TouchableOpacity
                style={[styles.addProductBtn, styles.labelTop]}
                onPress={() => setProductSearchOpen(true)}
                disabled={loading}
                activeOpacity={0.75}
              >
                <Ionicons name="add-circle-outline" size={18} color={C.primary} />
                <Text style={styles.addProductBtnText}>Mahsulot qo'shish</Text>
              </TouchableOpacity>

              {/* Mahsulot qidirish paneli */}
              {productSearchOpen && (
                <ProductSearchPanel
                  productSearch={productSearch}
                  onSearchChange={setProductSearch}
                  onClose={() => {
                    setProductSearchOpen(false);
                    setProductSearch('');
                  }}
                  isLoading={stockLevels.isLoading}
                  availableProducts={availableProducts}
                  addedKeys={addedKeys}
                  onAddProduct={handleAddProduct}
                />
              )}

              {/* Izoh */}
              <Text style={[styles.label, styles.labelTop]}>Izoh (ixtiyoriy)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Qo'shimcha ma'lumot..."
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={3}
                editable={!loading}
                returnKeyType="done"
                textAlignVertical="top"
              />
            </ScrollView>

            <TransferActions
              loading={loading}
              onCancel={handleClose}
              onSubmit={() => { void handleSubmit(); }}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
