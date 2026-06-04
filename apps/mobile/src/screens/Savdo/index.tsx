import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import ProductCard from './ProductCard';
import ScannerModal from './ScannerModal';
import PaymentSheet from './PaymentSheet';
import OnlinePaymentSheet from './OnlinePaymentSheet';
import LowStockSheet from './LowStockSheet';
import CustomerSearchSheet from './CustomerSearchSheet';
import ShiftGuard from '../../components/common/ShiftGuard';
import { useShiftStore } from '../../store/shiftStore';
import { catalogApi, type CatalogProduct } from '../../api/catalog.api';
import type { Customer } from '../../api/customers.api';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { useLoyaltyConfig } from '../../hooks/useLoyalty';
import { C, toProduct } from './components/utils';
import SavdoHeader from './components/SavdoHeader';
import SavdoSearchBar from './components/SavdoSearchBar';
import CategoryTabs from './components/CategoryTabs';
import CartBar from './components/CartBar';
import { styles } from './styles';
import useSavdoCart from './useSavdoCart';
import useSavdoOrder from './useSavdoOrder';

// Fallback UZS value of 1 loyalty point while the loyalty config loads.
// Mirrors LoyaltySection's `config?.redeemRate ?? 100` default.
const DEFAULT_REDEEM_RATE = 100;

// ─── Screen ────────────────────────────────────────────
export default function SavdoScreen() {
  const { isShiftOpen, shiftId } = useShiftStore();

  const [search, setSearch]               = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [scannerVisible, setScannerVisible]   = useState(false);
  const [paymentVisible, setPaymentVisible]   = useState(false);
  const [lowStockVisible, setLowStockVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSheetVisible, setCustomerSheetVisible] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(0);

  const { pending: pendingCount, refresh: refreshQueue } = useOfflineQueue();

  const {
    cart, addToCart, removeFromCart, decrementFromCart,
    clearCart, cartQty, totalItems, totalPrice,
  } = useSavdoCart();

  // ─── Loyalty discount (single source of truth) ───────
  // Lifted here (lowest common ancestor of LoyaltySection + useSavdoOrder)
  // so the redeem discount shown to the customer === the discount charged.
  const { data: loyaltyConfig } = useLoyaltyConfig();
  const redeemRate = loyaltyConfig?.redeemRate ?? DEFAULT_REDEEM_RATE;
  const discountAmount = Math.min(redeemPoints * redeemRate, totalPrice);

  const closePayment = () => setPaymentVisible(false);
  const resetCustomer = () => { setSelectedCustomer(null); setRedeemPoints(0); };

  const {
    orderLoading, onlinePaymentVisible, paymentIntent,
    handleConfirm, handleOnlinePaymentSuccess, handleOnlinePaymentCancel,
  } = useSavdoOrder({
    cart, totalPrice, discountAmount, shiftId, selectedCustomer, redeemPoints,
    clearCart, closePayment, resetCustomer, refreshQueue,
  });

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
                onDecrement={(p) => decrementFromCart(p, closePayment)}
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
          discountAmount={discountAmount}
          redeemRate={redeemRate}
          onClose={closePayment}
          onRemoveItem={(id) => removeFromCart(id, closePayment)}
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
