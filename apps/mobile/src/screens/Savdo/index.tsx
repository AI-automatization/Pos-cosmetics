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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
import ScannerModal from './ScannerModal';
import PaymentSheet, { type PaymentMethod } from './PaymentSheet';
import { isOnlineMethod } from './PaymentSheetTypes';
import OnlinePaymentSheet from './OnlinePaymentSheet';
import LowStockSheet from './LowStockSheet';
import { useShiftStore } from '../../store/shiftStore';
import { catalogApi, type CatalogProduct } from '../../api/catalog.api';
import { salesApi } from '../../api/sales.api';
import { paymentsApi, type PaymentIntentResponse } from '../../api/payments.api';
import { loyaltyApi } from '../../api/loyalty.api';
import type { Customer } from '../../api/customers.api';
import CustomerSearchSheet from './CustomerSearchSheet';
import { type SavdoStackParamList } from '../../navigation/types';
import ShiftGuard from '../../components/common/ShiftGuard';
import { isNetworkOnline } from '../../hooks/useNetworkStatus';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

import { C, toProduct, type CartItem } from './components/utils';
import SavdoHeader from './components/SavdoHeader';
import SavdoSearchBar from './components/SavdoSearchBar';
import CategoryTabs from './components/CategoryTabs';
import CartBar from './components/CartBar';

// ─── Screen ────────────────────────────────────────────
export default function SavdoScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<SavdoStackParamList>>();
  const { isShiftOpen, shiftId } = useShiftStore();

  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [scannerVisible, setScannerVisible]   = useState(false);
  const [paymentVisible, setPaymentVisible]   = useState(false);
  const [lowStockVisible, setLowStockVisible] = useState(false);
  const [orderLoading, setOrderLoading]       = useState(false);
  const [onlinePaymentVisible, setOnlinePaymentVisible] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponse | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSheetVisible, setCustomerSheetVisible] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(0);

  const { pending: pendingCount, refresh: refreshQueue } = useOfflineQueue();

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

  // ─── Customer ────────────────────────────────────────
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSheetVisible(false);
    setRedeemPoints(0);
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
      navigation.navigate('NasiyaScreen', { openNewDebt: true, amount: totalPrice, products: cart });
      setPaymentVisible(false);
      setCart([]);
      return;
    }
    if (!shiftId) {
      Alert.alert('Xatolik', 'Smena ochilmagan. Avval smena oching.');
      return;
    }
    // Online payment flow (PAYME / CLICK / UZUM)
    if (isOnlineMethod(method)) {
      setOrderLoading(true);
      try {
        const order = await salesApi.createOrder({
          shiftId,
          items: cart.map((i) => ({
            productId: i.product.id,
            quantity: i.qty,
            unitPrice: i.product.sellPrice,
          })),
          notes: `To'lov: ${method}`,
        });
        const intent = await paymentsApi.createIntent({
          orderId: order.id,
          method,
          amount: totalPrice,
        });
        setPaymentIntent(intent);
        setPaymentVisible(false);
        setOnlinePaymentVisible(true);
      } catch {
        Alert.alert('Xatolik', "Online to'lov yaratilmadi. Qayta urinib ko'ring.");
      } finally {
        setOrderLoading(false);
      }
      return;
    }
    // Standard payment flow (NAQD / KARTA)
    setOrderLoading(true);
    try {
      const order = await salesApi.createOrder({
        shiftId,
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity:  i.qty,
          unitPrice: i.product.sellPrice,
        })),
        notes: `To'lov: ${method}`,
      });
      if (redeemPoints > 0 && selectedCustomer) {
        try {
          await loyaltyApi.redeem(selectedCustomer.id, redeemPoints, order.id);
        } catch {
          // Don't block sale if loyalty redeem fails
        }
      }
      setPaymentVisible(false);
      setCart([]);
      setSelectedCustomer(null);
      setRedeemPoints(0);
    } catch {
      const online = await isNetworkOnline();
      if (!online) {
        const { offlineQueueService } = await import('../../services/OfflineQueueService');
        await offlineQueueService.enqueue({
          shiftId: shiftId!,
          items: cart.map((i) => ({
            productId: i.product.id,
            quantity: i.qty,
            unitPrice: i.product.sellPrice,
          })),
          notes: `To'lov: ${method}`,
        });
        await refreshQueue();
        Alert.alert('Offline rejim', "Buyurtma saqlandi. Internet ulanganda avtomatik yuboriladi.");
        setPaymentVisible(false);
        setCart([]);
        setSelectedCustomer(null);
        setRedeemPoints(0);
      } else {
        Alert.alert('Xatolik', "Buyurtma saqlanmadi. Qayta urinib ko'ring.");
      }
    } finally {
      setOrderLoading(false);
    }
  };

  // ─── Online payment callbacks ─────────────────────────
  const handleOnlinePaymentSuccess = () => {
    setOnlinePaymentVisible(false);
    setPaymentIntent(null);
    setCart([]);
  };

  const handleOnlinePaymentCancel = async () => {
    if (paymentIntent) {
      try { await paymentsApi.cancelIntent(paymentIntent.id); } catch { /* noop */ }
    }
    setOnlinePaymentVisible(false);
    setPaymentIntent(null);
  };

  const cartQty    = (productId: string) => cart.find((i) => i.product.id === productId)?.qty ?? 0;
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.product.sellPrice * i.qty, 0);

  // ─── Render ───────────────────────────────────────────
  return (
    <ShiftGuard>
      <SafeAreaView style={styles.safe} edges={['top']}>

        <SavdoHeader
          alertCount={alertCount}
          isShiftOpen={isShiftOpen}
          shiftId={shiftId}
          onBellPress={() => setLowStockVisible(true)}
        />

        {pendingCount > 0 && (
          <View style={styles.offlineBadge}>
            <Ionicons name="cloud-upload-outline" size={14} color="#D97706" />
            <Text style={styles.offlineBadgeText}>
              {pendingCount} ta buyurtma yuborilmagan
            </Text>
          </View>
        )}

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
                <Text style={styles.emptySubText}>Qidiruvni o'zgartiring yoki kategoriyani tanlang</Text>
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
          customerId={selectedCustomer?.id ?? null}
          customerPhone={selectedCustomer?.phone ?? null}
          redeemPoints={redeemPoints}
          onRedeemPointsChange={setRedeemPoints}
          onSelectCustomer={() => setCustomerSheetVisible(true)}
        />

        <CustomerSearchSheet
          visible={customerSheetVisible}
          onClose={() => setCustomerSheetVisible(false)}
          onSelect={handleSelectCustomer}
        />

        <OnlinePaymentSheet
          visible={onlinePaymentVisible}
          intent={paymentIntent}
          onSuccess={handleOnlinePaymentSuccess}
          onCancel={handleOnlinePaymentCancel}
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
  empty:        { paddingTop: 80, alignItems: 'center', gap: 8 },
  emptyText:    { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  emptySubText: { fontSize: 13, color: '#9CA3AF' },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  offlineBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D97706',
  },
});
