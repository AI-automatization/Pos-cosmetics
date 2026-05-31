import { useState, useMemo, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  catalogApi,
  type CatalogProduct,
  type CatalogCategory,
  type CreateProductDto,
} from '../../api/catalog.api';
import type { CatalogStackParamList } from '../../navigation/types';
import { C } from './ProductFormScreen.styles';
import {
  productSchema,
  extractFieldErrors,
  type ProductFormErrors,
} from '../../validation/product.schema';

// ─── Navigation types ──────────────────────────────────
type RouteProps = RouteProp<CatalogStackParamList, 'ProductForm'>;
type NavProp = NativeStackNavigationProp<CatalogStackParamList>;

// ─── Props ─────────────────────────────────────────────
interface UseProductFormOptions {
  readonly product?: CatalogProduct;
  readonly onClose?: () => void;
  readonly onSaved?: () => void;
}

function extractApiError(err: unknown, fallback: string): string {
  const msg =
    (err as { response?: { data?: { message?: string } } })
      ?.response?.data?.message ?? fallback;
  return Array.isArray(msg) ? (msg as string[]).join('\n') : String(msg);
}

export function useProductForm({ product, onClose, onSaved }: UseProductFormOptions) {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const routeProductId = route.params?.productId;
  const handleClose = onClose ?? (() => navigation.goBack());
  const isEdit = !!(product ?? routeProductId);

  // ─── Form state ────────────────────────────────────────
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
  const [errors, setErrors]           = useState<ProductFormErrors>({});

  const queryClient = useQueryClient();

  // ─── Queries ───────────────────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: catalogApi.getCategories,
    staleTime: 5 * 60_000,
  });

  const { data: editProduct } = useQuery({
    queryKey: ['catalog-product', routeProductId],
    queryFn: () => catalogApi.getProductById(routeProductId!),
    enabled: !!routeProductId && !product,
    staleTime: 30_000,
  });

  // ─── Fill form for edit mode ───────────────────────────
  useEffect(() => {
    const p = product ?? editProduct;
    if (!p) return;
    setName(p.name);
    setSku(p.sku ?? '');
    setCategoryId(p.categoryId ?? '');
    setCostPrice(String(p.costPrice));
    setSellPrice(String(p.sellPrice));
    setMinStock(String(p.minStockLevel ?? 0));
    setBarcode(p.barcode ?? '');
    setIsActive(p.isActive);
  }, [product, editProduct]);

  // ─── Derived values ────────────────────────────────────
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

  // ─── Handlers ──────────────────────────────────────────
  const handleSave = useCallback(() => {
    // ─── Zod validation ─────────────────────────────────
    const result = productSchema.safeParse({
      name: name.trim(),
      sku: sku.trim() || undefined,
      barcode: barcode.trim() || undefined,
      categoryId: categoryId || undefined,
      costPrice: costNum,
      salePrice: sellNum,
      minStock: parseInt(minStock, 10) || undefined,
      isActive,
      description: description.trim() || undefined,
    });

    if (!result.success) {
      setErrors(extractFieldErrors(result.error.issues));
      return;
    }

    // Validation muvaffaqiyatli — xatoliklarni tozalash
    setErrors({});
    setLoading(true);

    const dto: CreateProductDto = {
      name: result.data.name,
      sku: result.data.sku,
      categoryId: result.data.categoryId,
      costPrice: result.data.costPrice,
      sellPrice: result.data.salePrice,
      minStockLevel: result.data.minStock ?? 0,
      barcode: result.data.barcode,
      isActive: result.data.isActive ?? true,
      description: result.data.description,
    };

    const editId = product?.id ?? routeProductId;

    if (isEdit && editId) {
      catalogApi.updateProduct(editId, dto)
        .then(() => {
          void queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
          void queryClient.invalidateQueries({ queryKey: ['catalog-product', editId] });
          Alert.alert('Muvaffaqiyat', `"${name}" yangilandi`, [
            { text: 'OK', onPress: () => { onSaved?.(); handleClose(); } },
          ]);
        })
        .catch((err: unknown) => {
          Alert.alert('Xatolik', extractApiError(err, 'Mahsulot yangilashda xatolik yuz berdi.'));
        })
        .finally(() => setLoading(false));
    } else {
      catalogApi.createProduct(dto)
        .then(() => {
          void queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
          Alert.alert('Muvaffaqiyat', `"${name}" qo'shildi`, [
            { text: 'OK', onPress: () => { onSaved?.(); handleClose(); } },
          ]);
        })
        .catch((err: unknown) => {
          Alert.alert('Xatolik', extractApiError(err, 'Mahsulot qo\'shishda xatolik yuz berdi.'));
        })
        .finally(() => setLoading(false));
    }
  }, [
    name, sku, categoryId, costNum, sellNum, minStock,
    barcode, isActive, description, isEdit, product?.id, routeProductId,
    queryClient, onSaved, handleClose,
  ]);

  const handleCategoryPick = useCallback(() => {
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
  }, [categories]);

  return {
    // state
    name, setName,
    sku, setSku,
    categoryId,
    description, setDescription,
    costPrice, setCostPrice,
    sellPrice, setSellPrice,
    minStock, setMinStock,
    barcode, setBarcode,
    isActive, setIsActive,
    loading,
    errors,
    // derived
    isEdit,
    costNum, sellNum,
    margin, marginColor,
    selectedCategory,
    canSave,
    product,
    // handlers
    handleSave,
    handleCategoryPick,
    handleClose,
  };
}
