import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { catalogApi, type CatalogProduct, type CatalogCategory } from '../../api/catalog.api';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
  red:     '#DC2626',
};

// ─── Props ─────────────────────────────────────────────
interface Props {
  product?: CatalogProduct;
  onClose: () => void;
  onSaved?: () => void;
}

// ─── Sub-components ────────────────────────────────────
function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {children}
    </View>
  );
}

function Input({
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = true,
  multiline = false,
}: {
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  editable?: boolean;
  multiline?: boolean;
}) {
  return (
    <TextInput
      style={[
        styles.input,
        !editable && styles.inputReadOnly,
        multiline && styles.inputMultiline,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={C.muted}
      keyboardType={keyboardType}
      editable={editable}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  );
}

// ─── Main Component ────────────────────────────────────
export default function ProductFormScreen({ product, onClose, onSaved }: Props) {
  const isEdit = !!product;

  const [name, setName]               = useState(product?.name ?? '');
  const [sku, setSku]                 = useState(product?.sku ?? '');
  const [categoryId, setCategoryId]   = useState(product?.categoryId ?? '');
  const [description, setDescription] = useState('');
  const [costPrice, setCostPrice]     = useState(String(product?.costPrice ?? ''));
  const [sellPrice, setSellPrice]     = useState(String(product?.sellPrice ?? ''));
  const [minStock, setMinStock]       = useState(String(product?.minStockLevel ?? '0'));
  const [barcode, setBarcode]         = useState(product?.barcode ?? '');
  const [isActive, setIsActive]       = useState(product?.isActive ?? true);
  const [loading, setLoading]         = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: catalogApi.getCategories,
    staleTime: 5 * 60_000,
  });

  const costNum = parseFloat(costPrice.replace(/\s/g, '')) || 0;
  const sellNum = parseFloat(sellPrice.replace(/\s/g, '')) || 0;
  const margin  = costNum > 0
    ? Math.round(((sellNum - costNum) / costNum) * 100)
    : 0;
  const marginColor = margin > 0 ? C.green : margin < 0 ? C.red : C.muted;

  const selectedCategory = useMemo(
    () => categories.find((c: CatalogCategory) => c.id === categoryId),
    [categories, categoryId],
  );

  const canSave = name.trim().length > 0 && sellNum > 0;

  const handleSave = () => {
    if (!canSave) return;
    setLoading(true);
    // API call placeholder
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Muvaffaqiyat', `"${name}" ${isEdit ? 'yangilandi' : 'qo\'shildi'}`, [
        { text: 'OK', onPress: () => { onSaved?.(); onClose(); } },
      ]);
    }, 800);
  };

  const handleCategoryPick = () => {
    if (categories.length === 0) return;
    Alert.alert(
      'Kategoriyani tanlang',
      undefined,
      [
        ...categories.map((cat: CatalogCategory) => ({
          text: cat.name,
          onPress: () => setCategoryId(cat.id),
        })),
        { text: 'Bekor qilish', style: 'cancel' as const },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={onClose} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Tahrirlash' : 'Yangi mahsulot'}
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={!canSave || loading}
        >
          {loading
            ? <ActivityIndicator size="small" color="#FFFFFF" />
            : <Text style={styles.saveBtnText}>Saqlash</Text>
          }
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Image picker */}
          <TouchableOpacity style={styles.imagePicker} activeOpacity={0.75}>
            <View style={styles.imageCircle}>
              <Ionicons name="camera-outline" size={28} color={C.muted} />
            </View>
            <Text style={styles.imageLabel}>Rasm qo'shish</Text>
            <Text style={styles.imageHint}>JPG, PNG · maks 5MB</Text>
          </TouchableOpacity>

          {/* Section: Asosiy ma'lumot */}
          <SectionTitle>ASOSIY MA'LUMOT</SectionTitle>
          <View style={styles.card}>
            <FormField label="Mahsulot nomi" required>
              <Input value={name} onChangeText={setName} placeholder="Masalan: Nivea krem 200ml" />
            </FormField>
            <View style={styles.fieldDivider} />
            <FormField label="SKU (Artikul)">
              <Input value={sku} onChangeText={setSku} placeholder="SKU-001" />
            </FormField>
            <View style={styles.fieldDivider} />
            <FormField label="Kategoriya">
              <TouchableOpacity style={styles.selectRow} onPress={handleCategoryPick}>
                <Text style={[styles.selectText, !selectedCategory && styles.selectPlaceholder]}>
                  {selectedCategory?.name ?? 'Kategoriya tanlang'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={C.muted} />
              </TouchableOpacity>
            </FormField>
            <View style={styles.fieldDivider} />
            <FormField label="Tavsif">
              <Input
                value={description}
                onChangeText={setDescription}
                placeholder="Mahsulot haqida qisqacha..."
                multiline
              />
            </FormField>
          </View>

          {/* Section: Narxlar */}
          <SectionTitle>NARXLAR</SectionTitle>
          <View style={styles.card}>
            <View style={styles.priceRow}>
              <FormField label="Kelish narxi">
                <Input
                  value={costPrice}
                  onChangeText={setCostPrice}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </FormField>
              <FormField label="Sotuv narxi" required>
                <Input
                  value={sellPrice}
                  onChangeText={setSellPrice}
                  placeholder="0"
                  keyboardType="numeric"
                />
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

          {/* Section: Zaxira */}
          <SectionTitle>ZAXIRA</SectionTitle>
          <View style={styles.card}>
            <FormField label="Minimal zaxira">
              <Input value={minStock} onChangeText={setMinStock} keyboardType="numeric" placeholder="5" />
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

          {/* Section: Barcode */}
          <SectionTitle>BARCODE</SectionTitle>
          <View style={styles.card}>
            <FormField label="Asosiy barcode">
              <View style={styles.barcodeRow}>
                <Input value={barcode} onChangeText={setBarcode} placeholder="8600000000000" keyboardType="numeric" />
                <TouchableOpacity style={styles.scanBtn}>
                  <Ionicons name="scan-outline" size={20} color={C.primary} />
                </TouchableOpacity>
              </View>
            </FormField>
          </View>

          {/* Section: Holat */}
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
                onValueChange={setIsActive}
                trackColor={{ false: C.border, true: '#2563EB' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Bottom save button */}
          <TouchableOpacity
            style={[styles.bottomBtn, !canSave && styles.bottomBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!canSave || loading}
          >
            {loading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.bottomBtnText}>
                    {isEdit ? 'O\'zgarishlarni saqlash' : 'Mahsulot qo\'shish'}
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

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
    gap: 10,
  },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },
  saveBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#2563EB', borderRadius: 10,
    minWidth: 72, alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#E5E7EB' },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  content: { padding: 16, paddingBottom: 40, gap: 8 },
  imagePicker: {
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    borderStyle: 'dashed',
    alignItems: 'center', paddingVertical: 24, gap: 6,
    marginBottom: 4,
  },
  imageCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  imageLabel: { fontSize: 14, fontWeight: '600', color: C.text },
  imageHint: { fontSize: 12, color: C.muted },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, marginTop: 8, marginBottom: 6,
  },
  card: {
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 4,
  },
  field: { paddingVertical: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: C.muted, marginBottom: 6 },
  required: { color: C.red },
  fieldDivider: { height: 1, backgroundColor: '#F3F4F6' },
  input: {
    height: 44, backgroundColor: '#F9FAFB', borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, fontSize: 15, color: C.text,
  },
  inputReadOnly: { backgroundColor: '#F3F4F6', color: C.muted },
  inputMultiline: { height: 80, paddingTop: 10 },
  selectRow: {
    height: 44, backgroundColor: '#F9FAFB', borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  selectText: { fontSize: 15, color: C.text },
  selectPlaceholder: { color: C.muted },
  priceRow: { flexDirection: 'row', gap: 12 },
  marginRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingTop: 4, paddingBottom: 12,
  },
  marginLabel: { fontSize: 13, color: C.muted, fontWeight: '500' },
  marginBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  marginText: { fontSize: 13, fontWeight: '800' },
  marginHint: { fontSize: 12, color: C.muted },
  barcodeRow: { flexDirection: 'row', gap: 8 },
  scanBtn: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
  },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: C.text },
  toggleHint: { fontSize: 12, color: C.muted, marginTop: 2 },
  bottomBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#2563EB',
    borderRadius: 14, height: 54, marginTop: 8,
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  bottomBtnDisabled: {
    backgroundColor: '#E5E7EB', shadowOpacity: 0, elevation: 0,
  },
  bottomBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
