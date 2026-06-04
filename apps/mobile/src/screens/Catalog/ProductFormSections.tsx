import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CatalogProduct } from '../../api/catalog.api';
import type { ProductFormErrors } from '../../validation/product.schema';
import { SectionTitle, FormField, Input } from './ProductFormFields';
import { styles, C } from './ProductFormScreen.styles';

// ─── Image Picker ────────────────────────────────────────
export function ImagePickerSection() {
  return (
    <TouchableOpacity style={styles.imagePicker} activeOpacity={0.75}>
      <View style={styles.imageCircle}>
        <Ionicons name="camera-outline" size={28} color={C.muted} />
      </View>
      <Text style={styles.imageLabel}>Rasm qo'shish</Text>
      <Text style={styles.imageHint}>JPG, PNG · maks 5MB</Text>
    </TouchableOpacity>
  );
}

// ─── Basic Info Section ──────────────────────────────────
interface BasicInfoProps {
  readonly name: string;
  readonly onNameChange: (v: string) => void;
  readonly sku: string;
  readonly onSkuChange: (v: string) => void;
  readonly selectedCategoryName: string | undefined;
  readonly onCategoryPick: () => void;
  readonly description: string;
  readonly onDescriptionChange: (v: string) => void;
  readonly errors?: ProductFormErrors;
}

export function BasicInfoSection({
  name, onNameChange,
  sku, onSkuChange,
  selectedCategoryName, onCategoryPick,
  description, onDescriptionChange,
  errors,
}: BasicInfoProps) {
  return (
    <>
      <SectionTitle>ASOSIY MA'LUMOT</SectionTitle>
      <View style={styles.card}>
        <FormField label="Mahsulot nomi" required error={errors?.name}>
          <Input value={name} onChangeText={onNameChange} placeholder="Masalan: Nivea krem 200ml" />
        </FormField>
        <View style={styles.fieldDivider} />
        <FormField label="SKU (Artikul)" error={errors?.sku}>
          <Input value={sku} onChangeText={onSkuChange} placeholder="SKU-001" />
        </FormField>
        <View style={styles.fieldDivider} />
        <FormField label="Kategoriya">
          <TouchableOpacity style={styles.selectRow} onPress={onCategoryPick}>
            <Text style={[styles.selectText, !selectedCategoryName && styles.selectPlaceholder]}>
              {selectedCategoryName ?? 'Kategoriya tanlang'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        </FormField>
        <View style={styles.fieldDivider} />
        <FormField label="Tavsif">
          <Input
            value={description}
            onChangeText={onDescriptionChange}
            placeholder="Mahsulot haqida qisqacha..."
            multiline
          />
        </FormField>
      </View>
    </>
  );
}

// ─── Price Section ───────────────────────────────────────
interface PriceSectionProps {
  readonly costPrice: string;
  readonly onCostPriceChange: (v: string) => void;
  readonly sellPrice: string;
  readonly onSellPriceChange: (v: string) => void;
  readonly costNum: number;
  readonly sellNum: number;
  readonly margin: number;
  readonly marginColor: string;
  readonly errors?: ProductFormErrors;
}

export function PriceSection({
  costPrice, onCostPriceChange,
  sellPrice, onSellPriceChange,
  costNum, sellNum,
  margin, marginColor,
  errors,
}: PriceSectionProps) {
  return (
    <>
      <SectionTitle>NARXLAR</SectionTitle>
      <View style={styles.card}>
        <View style={styles.priceRow}>
          <FormField label="Kelish narxi" error={errors?.costPrice}>
            <Input value={costPrice} onChangeText={onCostPriceChange} placeholder="0" keyboardType="numeric" />
          </FormField>
          <FormField label="Sotuv narxi" required error={errors?.salePrice}>
            <Input value={sellPrice} onChangeText={onSellPriceChange} placeholder="0" keyboardType="numeric" />
          </FormField>
        </View>
        {costNum > 0 && sellNum > 0 && (
          <View style={styles.marginRow}>
            <Text style={styles.marginLabel}>Marja</Text>
            <View style={[styles.marginBadge, { backgroundColor: marginColor + '18' }]}>
              <Text style={[styles.marginText, { color: marginColor }]}>
                {margin > 0 ? '+' : ''}{margin}%
              </Text>
            </View>
            <Text style={styles.marginHint}>
              = {(sellNum - costNum).toLocaleString('ru-RU')} UZS
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

// ─── Stock Section ───────────────────────────────────────
interface StockSectionProps {
  readonly minStock: string;
  readonly onMinStockChange: (v: string) => void;
  readonly isEdit: boolean;
  readonly product?: CatalogProduct;
  readonly errors?: ProductFormErrors;
}

export function StockSection({ minStock, onMinStockChange, isEdit, product, errors }: StockSectionProps) {
  return (
    <>
      <SectionTitle>ZAXIRA</SectionTitle>
      <View style={styles.card}>
        <FormField label="Minimal zaxira" error={errors?.minStock}>
          <Input value={minStock} onChangeText={onMinStockChange} keyboardType="numeric" placeholder="5" />
        </FormField>
        {isEdit && (
          <>
            <View style={styles.fieldDivider} />
            <FormField label="Joriy zaxira (o'qish uchun)">
              <Input value={String(product?.stockQuantity ?? 0)} editable={false} />
            </FormField>
          </>
        )}
      </View>
    </>
  );
}

// ─── Barcode Section ─────────────────────────────────────
interface BarcodeSectionProps {
  readonly barcode: string;
  readonly onBarcodeChange: (v: string) => void;
  readonly onScanPress: () => void;
  readonly errors?: ProductFormErrors;
}

export function BarcodeSection({ barcode, onBarcodeChange, onScanPress, errors }: BarcodeSectionProps) {
  return (
    <>
      <SectionTitle>BARCODE</SectionTitle>
      <View style={styles.card}>
        <FormField label="Asosiy barcode" error={errors?.barcode}>
          <View style={styles.barcodeRow}>
            <Input value={barcode} onChangeText={onBarcodeChange} placeholder="8600000000000" keyboardType="numeric" />
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={onScanPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Skanerlash"
            >
              <Ionicons name="scan-outline" size={20} color={C.primary} />
            </TouchableOpacity>
          </View>
        </FormField>
      </View>
    </>
  );
}

// ─── Status Toggle ───────────────────────────────────────
interface StatusToggleProps {
  readonly isActive: boolean;
  readonly onToggle: (v: boolean) => void;
}

export function StatusToggleSection({ isActive, onToggle }: StatusToggleProps) {
  return (
    <>
      <SectionTitle>HOLAT</SectionTitle>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Faol mahsulot</Text>
            <Text style={styles.toggleHint}>
              {isActive ? 'Savdoda ko\'rinadi' : 'Savdoda ko\'rinmaydi'}
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={onToggle}
            trackColor={{ false: C.border, true: '#2563EB' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
    </>
  );
}
