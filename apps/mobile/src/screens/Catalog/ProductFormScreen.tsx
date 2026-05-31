import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { CatalogProduct } from '../../api/catalog.api';
import { useProductForm } from './useProductForm';
import {
  ImagePickerSection,
  BasicInfoSection,
  PriceSection,
  StockSection,
  BarcodeSection,
  StatusToggleSection,
} from './ProductFormSections';
import { styles, C } from './ProductFormScreen.styles';

// ─── Props ─────────────────────────────────────────────
interface Props {
  product?: CatalogProduct;
  onClose?: () => void;
  onSaved?: () => void;
}

// ─── Main Component ────────────────────────────────────
export default function ProductFormScreen({ product, onClose, onSaved }: Props) {
  const form = useProductForm({ product, onClose, onSaved });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={form.handleClose} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {form.isEdit ? 'Tahrirlash' : 'Yangi mahsulot'}
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, form.loading && styles.saveBtnDisabled]}
          onPress={form.handleSave}
          activeOpacity={0.8}
          disabled={form.loading}
        >
          {form.loading
            ? <ActivityIndicator size="small" color="#FFFFFF" />
            : <Text style={styles.saveBtnText}>Saqlash</Text>
          }
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <ImagePickerSection />

          <BasicInfoSection
            name={form.name}
            onNameChange={form.setName}
            sku={form.sku}
            onSkuChange={form.setSku}
            selectedCategoryName={form.selectedCategory?.name}
            onCategoryPick={form.handleCategoryPick}
            description={form.description}
            onDescriptionChange={form.setDescription}
            errors={form.errors}
          />

          <PriceSection
            costPrice={form.costPrice}
            onCostPriceChange={form.setCostPrice}
            sellPrice={form.sellPrice}
            onSellPriceChange={form.setSellPrice}
            costNum={form.costNum}
            sellNum={form.sellNum}
            margin={form.margin}
            marginColor={form.marginColor}
            errors={form.errors}
          />

          <StockSection
            minStock={form.minStock}
            onMinStockChange={form.setMinStock}
            isEdit={form.isEdit}
            product={form.product}
            errors={form.errors}
          />

          <BarcodeSection
            barcode={form.barcode}
            onBarcodeChange={form.setBarcode}
            errors={form.errors}
          />

          <StatusToggleSection
            isActive={form.isActive}
            onToggle={form.setIsActive}
          />

          {/* Bottom save button */}
          <TouchableOpacity
            style={[styles.bottomBtn, form.loading && styles.bottomBtnDisabled]}
            onPress={form.handleSave}
            activeOpacity={0.85}
            disabled={form.loading}
          >
            {form.loading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.bottomBtnText}>
                    {form.isEdit ? 'O\'zgarishlarni saqlash' : 'Mahsulot qo\'shish'}
                  </Text>
                </>
              )
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
