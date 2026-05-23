// TransferSheet — ombordan do'konga o'tkazma

import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { UseMutationResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { branchesApi as branchApi, type Branch } from '../../api/branches.api';
import { catalogApi, type CatalogProduct } from '../../api/catalog.api';
import type { CreateTransferBody, CreateTransferResponse } from '../../api/inventory.api';
import { extractErrorMessage } from '../../utils/error';
import { C } from './KirimColors';
import { styles } from './TransferSheet.styles';
import {
  TransferItemRow,
  AddItemForm,
  EMPTY_LINE,
} from './TransferSheet.components';
import type { TransferLine } from './TransferSheet.components';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transferMutation: UseMutationResult<CreateTransferResponse, Error, CreateTransferBody>;
}

export default function TransferSheet({ visible, onClose, onSuccess, transferMutation }: Props) {
  const [fromBranchId, setFromBranchId] = useState('');
  const [toBranchId, setToBranchId]     = useState('');
  const [notes, setNotes]               = useState('');
  const [items, setItems]               = useState<TransferLine[]>([]);
  const [addingItem, setAddingItem]     = useState(false);
  const [newLine, setNewLine]           = useState<Omit<TransferLine, 'key'>>(EMPTY_LINE);
  const [productSearch, setProductSearch] = useState('');

  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn:  branchApi.getAll,
    staleTime: 5 * 60_000,
    enabled:  visible,
  });

  const { data: catalogProducts = [] } = useQuery<CatalogProduct[]>({
    queryKey: ['catalog-products-transfer'],
    queryFn:  () => catalogApi.getProducts(),
    staleTime: 5 * 60_000,
    enabled:  visible,
  });

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return [];
    const q = productSearch.toLowerCase();
    return catalogProducts
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 6);
  }, [catalogProducts, productSearch]);

  const resetAll = () => {
    setFromBranchId('');
    setToBranchId('');
    setNotes('');
    setItems([]);
    setAddingItem(false);
    setNewLine(EMPTY_LINE);
    setProductSearch('');
  };

  const handleClose = () => { resetAll(); onClose(); };

  const handleSelectProduct = (p: CatalogProduct) => {
    setNewLine((prev) => ({ ...prev, productId: p.id, productName: p.name }));
    setProductSearch('');
  };

  const handleAddItem = () => {
    if (!newLine.productId) { Alert.alert('Xatolik', 'Mahsulot tanlang'); return; }
    const qty = parseFloat(newLine.quantity);
    if (!qty || qty <= 0) { Alert.alert('Xatolik', "Miqdor 0 dan katta bo'lishi kerak"); return; }
    setItems((prev) => [...prev, { ...newLine, key: `${Date.now()}-${Math.random()}` }]);
    setNewLine(EMPTY_LINE);
    setProductSearch('');
    setAddingItem(false);
  };

  const handleRemoveItem = (key: string) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  const handleSubmit = async () => {
    if (!fromBranchId) { Alert.alert('Xatolik', 'Manba filialni tanlang'); return; }
    if (!toBranchId)   { Alert.alert('Xatolik', 'Manzil filialni tanlang'); return; }
    if (fromBranchId === toBranchId) { Alert.alert('Xatolik', 'Manba va manzil filial bir xil bo\'lmasin'); return; }
    if (items.length === 0) { Alert.alert('Xatolik', "Kamida bitta mahsulot qo'shing"); return; }

    try {
      await transferMutation.mutateAsync({
        fromBranchId,
        toBranchId,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity:  parseFloat(i.quantity),
        })),
      });
      resetAll();
      onSuccess();
    } catch (err) {
      Alert.alert('Xatolik', extractErrorMessage(err));
    }
  };

  const loading = transferMutation.isPending;
  const fromBranch = branches.find((b) => b.id === fromBranchId);
  const toBranch   = branches.find((b) => b.id === toBranchId);

  const handleCancelAddItem = () => {
    setAddingItem(false);
    setNewLine(EMPTY_LINE);
    setProductSearch('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.titleRow}>
              <View style={styles.titleLeft}>
                <MaterialCommunityIcons name="transfer" size={20} color={C.primary} />
                <Text style={styles.title}>Ombordan o'tkazma</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose} disabled={loading}>
                <Ionicons name="close" size={18} color={C.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              style={styles.scroll}
            >
              {/* Manba filial */}
              <Text style={styles.label}>Manba (kimdan)</Text>
              <View style={styles.branchList}>
                {branches.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.branchChip, fromBranchId === b.id && styles.branchChipActive]}
                    onPress={() => setFromBranchId(b.id)}
                    disabled={loading}
                  >
                    <Text style={[styles.branchChipText, fromBranchId === b.id && styles.branchChipTextActive]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Manzil filial */}
              <Text style={[styles.label, styles.labelMarginTop]}>Manzil (kimga)</Text>
              <View style={styles.branchList}>
                {branches.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.branchChip,
                      toBranchId === b.id && styles.branchChipActive,
                      b.id === fromBranchId && styles.branchChipDisabled,
                    ]}
                    onPress={() => b.id !== fromBranchId && setToBranchId(b.id)}
                    disabled={loading || b.id === fromBranchId}
                  >
                    <Text style={[
                      styles.branchChipText,
                      toBranchId === b.id && styles.branchChipTextActive,
                      b.id === fromBranchId && styles.branchChipTextDisabled,
                    ]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Yo'nalish ko'rsatkich */}
              {fromBranch && toBranch && (
                <View style={styles.routeRow}>
                  <Text style={styles.routeText} numberOfLines={1}>{fromBranch.name}</Text>
                  <Ionicons name="arrow-forward" size={16} color={C.primary} />
                  <Text style={styles.routeText} numberOfLines={1}>{toBranch.name}</Text>
                </View>
              )}

              {/* Mahsulotlar */}
              <Text style={[styles.label, styles.labelMarginTop]}>Mahsulotlar</Text>

              {items.map((item) => (
                <TransferItemRow
                  key={item.key}
                  item={item}
                  onRemove={handleRemoveItem}
                  disabled={loading}
                />
              ))}

              {/* Mahsulot qo'shish formi */}
              {addingItem ? (
                <AddItemForm
                  newLine={newLine}
                  productSearch={productSearch}
                  filteredProducts={filteredProducts}
                  onChangeNewLine={setNewLine}
                  onProductSearchChange={setProductSearch}
                  onSelectProduct={handleSelectProduct}
                  onAdd={handleAddItem}
                  onCancel={handleCancelAddItem}
                />
              ) : (
                <TouchableOpacity
                  style={styles.addItemBtn}
                  onPress={() => setAddingItem(true)}
                  disabled={loading}
                >
                  <Ionicons name="add" size={18} color={C.primary} />
                  <Text style={styles.addItemBtnText}>Mahsulot qo'shish</Text>
                </TouchableOpacity>
              )}

              {/* Izoh */}
              <Text style={[styles.label, styles.labelMarginTop]}>Izoh (ixtiyoriy)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Qo'shimcha ma'lumot..."
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={loading}>
                <Text style={styles.cancelBtnText}>Bekor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={C.white} size="small" />
                  : <Text style={styles.submitBtnText}>Yuborish</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
