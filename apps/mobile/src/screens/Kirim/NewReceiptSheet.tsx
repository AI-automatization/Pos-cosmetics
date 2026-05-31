import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { UseMutationResult } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import type { CreateReceiptBody, CreateReceiptResponse } from '../../api/inventory.api';
import { C } from './components/types';
import SupplierForm from './components/SupplierForm';
import AddedItemsList from './components/AddedItemsList';
import ScannedItemMiniForm from './components/ScannedItemMiniForm';
import ManualItemMiniForm from './components/ManualItemMiniForm';
import AddItemButtons from './components/AddItemButtons';
import CameraOverlay from './components/CameraOverlay';
import { useNewReceiptForm } from './useNewReceiptForm';
import styles from './NewReceiptSheet.styles';

// ─── Types ──────────────────────────────────────────────
interface Props {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly createMutation: UseMutationResult<CreateReceiptResponse, Error, CreateReceiptBody>;
}

// ─── Component ─────────────────────────────────────────
export default function NewReceiptSheet({ visible, onClose, onSuccess, createMutation }: Props) {
  const {
    form,
    items,
    addMode,
    manualLine,
    scanResult,
    scanLine,
    cameraOpen,
    isScanActive,
    scanLoading,
    productSearch,
    catalogProducts,
    filteredProducts,
    loading,
    setField,
    setScanLineField,
    setManualLineField,
    setProductSearch,
    handleClose,
    handleBarcodeScanned,
    handleAddScannedItem,
    handleAddManualItem,
    handleRemoveItem,
    handleSubmit,
    openCamera,
    closeCamera,
    openManualMode,
    cancelScan,
    cancelManual,
    selectProduct,
    clearProduct,
    setIsScanActive,
  } = useNewReceiptForm({ visible, onClose, onSuccess, createMutation });

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.kav}
          >
            <View style={styles.sheet}>
              <View style={styles.handle} />

              {/* Title row */}
              <View style={styles.titleRow}>
                <Text style={styles.title}>Yangi kirim</Text>
                <TouchableOpacity style={styles.closeIconBtn} onPress={handleClose} disabled={loading}>
                  <Ionicons name="close" size={18} color={C.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                style={styles.scroll}
              >
                {/* Yetkazib beruvchi */}
                <SupplierForm form={form} setField={setField} loading={loading} />

                {/* Mahsulotlar */}
                <Text style={styles.sectionTitle}>Mahsulotlar</Text>

                <AddedItemsList items={items} loading={loading} onRemove={handleRemoveItem} />

                {addMode === 'scanned' && scanResult && (
                  <ScannedItemMiniForm
                    scanLine={scanLine}
                    onChangeField={setScanLineField}
                    onAdd={handleAddScannedItem}
                    onCancel={cancelScan}
                  />
                )}

                {addMode === 'manual' && (
                  <ManualItemMiniForm
                    manualLine={manualLine}
                    onChangeField={setManualLineField}
                    catalogProducts={catalogProducts}
                    filteredProducts={filteredProducts}
                    productSearch={productSearch}
                    onProductSearch={setProductSearch}
                    onSelectProduct={selectProduct}
                    onClearProduct={clearProduct}
                    onAdd={handleAddManualItem}
                    onCancel={cancelManual}
                  />
                )}

                {addMode === 'none' && (
                  <AddItemButtons
                    loading={loading}
                    onScanPress={openCamera}
                    onManualPress={openManualMode}
                  />
                )}

                {/* Izoh */}
                <Text style={[styles.label, styles.notesLabel]}>Izoh</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={form.notes}
                  onChangeText={setField('notes')}
                  placeholder="Qo'shimcha ma'lumot..."
                  placeholderTextColor={C.muted}
                  multiline
                  numberOfLines={3}
                  editable={!loading}
                  returnKeyType="done"
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
                    : <Text style={styles.submitBtnText}>Kirim yaratish</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>

          {/* Camera Overlay */}
          {cameraOpen && (
            <CameraOverlay
              scanLoading={scanLoading}
              isScanActive={isScanActive}
              onActivate={() => setIsScanActive(true)}
              onBarcodeScanned={handleBarcodeScanned}
              onClose={closeCamera}
            />
          )}
        </View>
      </Modal>
    </>
  );
}
