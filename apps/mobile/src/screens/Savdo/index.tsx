import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
import ScannerModal from './ScannerModal';
import PaymentSheet, { type PaymentMethod } from './PaymentSheet';
import LowStockSheet from './LowStockSheet';
import { useShiftStore } from '../../store/shiftStore';
import { catalogApi, type CatalogProduct } from '../../api/catalog.api';
import { salesApi } from '../../api/sales.api';
import { type TabParamList } from '../../navigation/types';
import ShiftGuard from '../../components/common/ShiftGuard';

import { C, toProduct, type CartItem } from './components/utils';
import SavdoHeader from './components/SavdoHeader';
import SavdoSearchBar from './components/SavdoSearchBar';
import CategoryTabs from './components/CategoryTabs';
import CartBar from './components/CartBar';

// ─── Screen ────────────────────────────────────────────
export default function SavdoScreen() {
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  const { isShiftOpen, shiftId } = useShiftStore();

  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [scannerVisible, setScannerVisible]   = useState(false);
  const [paymentVisible, setPaymentVisible]   = useState(false);
  const [lowStockVisible, setLowStockVisible] = useState(false);
  const [orderLoading, setOrderLoading]       = useState(false);

  // ─── API ─────────────────────────────────────────────
  const { data: rawProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['catalog-products'],
    queryFn:  () => catalogApi.getProducts(),
    staleTime: 5 * 60_000,
  });

  const { data: apiCategories = [] } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn:  () => catalogApi.getCategories(),
    staleTime: 10 * 60_000,
  });

  // ─── Derived ─────────────────────────────────────────
  const allProducts = useMemo(() => rawProducts.map(toProduct), [rawProducts]);

  const categories = useMemo(() => [
    { id: 'all', name: 'Hammasi' },
    ...apiCategories.map((c) => ({ id: c.id, name: c.name })),
  ], [apiCategories]);

  const products = useMemo(() =>
    allProducts.filter((p) => {
      const matchCat    = activeCategory === 'all' || p.categoryId === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }),
  [allProducts, search, activeCategory]);

  const lowStockProducts  = allProducts.filter((p) => p.stockQty > 0 && p.stockQty <= p.minStockLevel);
  const outOfStockProducts = allProducts.filter((p) => p.stockQty === 0);
  const alertCount        = lowStockProducts.length + outOfStockProducts.length;

  // ─── Cart helpers ─────────────────────────────────────
  const addToCart = (product: CartItem['product']) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.product.id !== productId);
      if (updated.length === 0) setPaymentVisible(false);
      return updated;
    });
  };

  const decrementFromCart = (product: CartItem['product']) => {
    setCart((prev) => {
      const item = prev.find((i) => i.product.id === product.id);
      if (!item) return prev;
      if (item.qty === 1) {
        const updated = prev.filter((i) => i.product.id !== product.id);
        if (updated.length === 0) setPaymentVisible(false);
        return updated;
      }
      return prev.map((i) =>
        i.product.id === product.id ? { ...i, qty: i.qty - 1 } : i,
      );
    });
  };

  // ─── Scanner ──────────────────────────────────────────
  const handleScanned = async (barcode: string) => {
    setScannerVisible(false);
    const inList = allProducts.find(
      (p) => p.name.toLowerCase().includes(barcode.toLowerCase()),
    );
    if (inList) {
      setActiveCategory('all');
      setSearch(inList.name);
      return;
    }
    try {
      const found = await catalogApi.getByBarcode(barcode);
      const product = toProduct({
        id: found.id, name: found.name, sku: found.sku,
        barcode: found.barcode, sellPrice: found.sellPrice,
        costPrice: found.costPrice, categoryId: null,
        categoryName: found.categoryName, unitName: found.unitName,
        stockQuantity: found.stockQuantity, minStockLevel: found.minStockLevel,
        isActive: true,
      } as CatalogProduct);
      addToCart(product);
    } catch {
      setSearch(barcode);
    }
  };

  // ─── Confirm order ────────────────────────────────────
  const handleConfirm = async (method: PaymentMethod, _received: number) => {
    if (method === 'NASIYA') {
      navigation.navigate('Nasiya', { openNewDebt: true, amount: totalPrice, products: cart });
      setPaymentVisible(false);
      setCart([]);
      return;
    }
    setOrderLoading(true);
    try {
      await salesApi.createOrder({
        shiftId: shiftId ?? undefined,
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity:  i.qty,
          unitPrice: i.product.sellPrice,
        })),
        notes: `To'lov: ${method}`,
      });
      setPaymentVisible(false);
      setCart([]);
    } catch {
      Alert.alert('Xatolik', "Buyurtma saqlanmadi. Qayta urinib ko'ring.");
    } finally {
      setOrderLoading(false);
    }
  };

  const cartQty    = (productId: string) => cart.find((i) => i.product.id === productId)?.qty ?? 0;
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.product.sellPrice * i.qty, 0);

  // ─── Render ───────────────────────────────────────────
  return (
    <ShiftGuard>
      <SafeAreaView style={styles.safe} edges={['top']}>

        <SavdoHeader alertCount={alertCount} onBellPress={() => setLowStockVisible(true)} />

        <SavdoSearchBar
          search={search}
          onSearch={setSearch}
          onScanPress={() => setScannerVisible(true)}
        />

        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* Product grid */}
        {productsLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(p) => p.id}
            numColumns={2}
            style={styles.flatList}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                cartQty={cartQty(item.id)}
                onPress={addToCart}
                onDecrement={decrementFromCart}
              />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Mahsulot topilmadi</Text>
              </View>
            }
          />
        )}

        <PaymentSheet
          visible={paymentVisible}
          cart={cart}
          total={totalPrice}
          onClose={() => setPaymentVisible(false)}
          onRemoveItem={removeFromCart}
          onConfirm={handleConfirm}
        />

        <ScannerModal
          visible={scannerVisible}
          onClose={() => setScannerVisible(false)}
          onScanned={handleScanned}
        />

        <LowStockSheet
          visible={lowStockVisible}
          onClose={() => setLowStockVisible(false)}
          lowStockProducts={lowStockProducts}
          outOfStockProducts={outOfStockProducts}
        />

        {totalItems > 0 && (
          <CartBar
            totalItems={totalItems}
            totalPrice={totalPrice}
            isShiftOpen={isShiftOpen}
            orderLoading={orderLoading}
            onPress={() => setPaymentVisible(true)}
          />
        )}

      </SafeAreaView>
    </ShiftGuard>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flatList:    { flex: 1 },
  grid:        { paddingHorizontal: 11, paddingBottom: 100, flexGrow: 1 },
  empty:       { paddingTop: 60, alignItems: 'center' },
  emptyText:   { fontSize: 15, color: C.muted },
});
