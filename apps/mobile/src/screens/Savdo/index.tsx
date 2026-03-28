import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import ProductCard, { Product } from './ProductCard';
import ScannerModal from './ScannerModal';
import PaymentSheet, { type PaymentMethod } from './PaymentSheet';
import LowStockSheet from './LowStockSheet';
import { useShiftStore } from '../../store/shiftStore';
import { catalogApi, type CatalogProduct } from '../../api/catalog.api';
import { salesApi } from '../../api/sales.api';
import { type TabParamList } from '../../navigation/types';
import ShiftGuard from '../../components/common/ShiftGuard';

// ─── Ranglar ───────────────────────────────────────────
const C = {
  primary: '#5B5BD6',
  bg: '#F5F5F7',
  white: '#FFFFFF',
  text: '#111827',
  muted: '#9CA3AF',
  border: '#E5E7EB',
  danger: '#EF4444',
};

// ─── Placeholder colors (product id dan deterministic) ──
const PLACEHOLDER_COLORS = [
  '#F5E6C8', '#F5D5E0', '#E8E8F5', '#D5E8F5',
  '#E8F5E8', '#FFF0E0', '#E0F0FF', '#F0FFE0',
];
function placeholderColor(id: string): string {
  return PLACEHOLDER_COLORS[id.charCodeAt(0) % PLACEHOLDER_COLORS.length] ?? '#E8E8F5';
}

// ─── CatalogProduct → Product mapper ───────────────────
function toProduct(p: CatalogProduct): Product {
  return {
    id: p.id,
    name: p.name,
    sellPrice: p.sellPrice,
    categoryId: p.categoryId ?? 'uncategorized',
    stockQty: p.stockQuantity ?? 0,
    minStockLevel: p.minStockLevel ?? 5,
    placeholderColor: placeholderColor(p.id),
  };
}

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}

// ─── Cart item ─────────────────────────────────────────
interface CartItem {
  product: Product;
  qty: number;
}

// ─── Screen ────────────────────────────────────────────
export default function SavdoScreen() {
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  const { isShiftOpen, shiftId } = useShiftStore();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [lowStockVisible, setLowStockVisible] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // ─── API: mahsulotlar ───────────────────────────────
  const { data: rawProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: () => catalogApi.getProducts(),
    staleTime: 5 * 60_000,
  });

  // ─── API: kategoriyalar ─────────────────────────────
  const { data: apiCategories = [] } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: () => catalogApi.getCategories(),
    staleTime: 10 * 60_000,
  });

  // ─── Mahsulotlarni map qilish ───────────────────────
  const allProducts = useMemo(() => rawProducts.map(toProduct), [rawProducts]);

  // ─── Kategoriyalar (Hammasi + API dan) ──────────────
  const categories = useMemo(() => [
    { id: 'all', name: 'Hammasi' },
    ...apiCategories.map((c) => ({ id: c.id, name: c.name })),
  ], [apiCategories]);

  // ─── Filterlangan mahsulotlar ───────────────────────
  const products = useMemo(() => {
    return allProducts.filter((p) => {
      const matchCat = activeCategory === 'all' || p.categoryId === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allProducts, search, activeCategory]);

  // ─── Kam qolgan / tugagan mahsulotlar ───────────────
  const lowStockProducts = allProducts.filter(
    (p) => p.stockQty > 0 && p.stockQty <= p.minStockLevel,
  );
  const outOfStockProducts = allProducts.filter((p) => p.stockQty === 0);
  const alertCount = lowStockProducts.length + outOfStockProducts.length;

  // ─── Savat yordamchilari ────────────────────────────
  const addToCart = (product: Product) => {
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

  const decrementFromCart = (product: Product) => {
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

  // ─── Barkod skanerlash ──────────────────────────────
  const handleScanned = async (barcode: string) => {
    setScannerVisible(false);
    // Avval yuklangan mahsulotlarda qidirish
    const inList = allProducts.find(
      (p) => p.name.toLowerCase().includes(barcode.toLowerCase()),
    );
    if (inList) {
      setActiveCategory('all');
      setSearch(inList.name);
      return;
    }
    // API dan barcode bo'yicha qidirish
    try {
      const found = await catalogApi.getByBarcode(barcode);
      const product = toProduct({
        id: found.id,
        name: found.name,
        sku: found.sku,
        barcode: found.barcode,
        sellPrice: found.sellPrice,
        costPrice: found.costPrice,
        categoryId: null,
        categoryName: found.categoryName,
        unitName: found.unitName,
        stockQuantity: found.stockQuantity,
        minStockLevel: found.minStockLevel,
        isActive: true,
      });
      addToCart(product);
    } catch {
      setSearch(barcode);
    }
  };

  // ─── Buyurtma yaratish ──────────────────────────────
  const handleConfirm = async (method: PaymentMethod, _received: number) => {
    if (method === 'NASIYA') {
      navigation.navigate('Nasiya', {
        openNewDebt: true,
        amount: totalPrice,
        products: cart,
      });
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
          quantity: i.qty,
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

  const cartQty = (productId: string) =>
    cart.find((i) => i.product.id === productId)?.qty ?? 0;

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.product.sellPrice * i.qty, 0);

  // ─── Render ───────────────────────────────────────────
  return (
    <ShiftGuard>
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Savdo</Text>
        <TouchableOpacity
          style={styles.headerIcon}
          activeOpacity={0.7}
          onPress={() => setLowStockVisible(true)}
        >
          <Ionicons name="notifications-outline" size={22} color={C.text} />
          {alertCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{alertCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Feather name="search" size={16} color={C.muted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchText}
            placeholder="Mahsulot qidirish..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.scanButton}
          activeOpacity={0.8}
          onPress={() => setScannerVisible(true)}
        >
          <Ionicons name="barcode-outline" size={22} color={C.white} />
        </TouchableOpacity>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesRow}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catTab, activeCategory === cat.id && styles.catTabActive]}
            onPress={() => setActiveCategory(cat.id)}
            activeOpacity={0.75}
          >
            <Text style={[styles.catText, activeCategory === cat.id && styles.catTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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

      {/* Payment sheet */}
      <PaymentSheet
        visible={paymentVisible}
        cart={cart}
        total={totalPrice}
        onClose={() => setPaymentVisible(false)}
        onRemoveItem={removeFromCart}
        onConfirm={handleConfirm}
      />

      {/* Scanner modal */}
      <ScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanned={handleScanned}
      />

      {/* Low stock sheet */}
      <LowStockSheet
        visible={lowStockVisible}
        onClose={() => setLowStockVisible(false)}
        lowStockProducts={lowStockProducts}
        outOfStockProducts={outOfStockProducts}
      />

      {/* Cart bar */}
      {totalItems > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartIconWrap}>
            <Ionicons name="cart-outline" size={24} color={C.primary} />
            <View style={styles.cartCount}>
              <Text style={styles.cartCountText}>{totalItems}</Text>
            </View>
          </View>

          <View style={styles.cartInfo}>
            <Text style={styles.cartLabel}>Umumiy hisob</Text>
            <Text style={styles.cartTotal}>{formatPrice(totalPrice)}</Text>
          </View>

          {isShiftOpen ? (
            <TouchableOpacity
              style={[styles.payButton, orderLoading && styles.payButtonDisabled]}
              activeOpacity={0.85}
              onPress={() => setPaymentVisible(true)}
              disabled={orderLoading}
            >
              {orderLoading ? (
                <ActivityIndicator size="small" color={C.white} />
              ) : (
                <Text style={styles.payButtonText}>To'lov →</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.payButton, styles.payButtonDisabled]}
              disabled
              activeOpacity={1}
            >
              <Text style={styles.payButtonText}>Smena oching</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
    </ShiftGuard>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    color: C.text,
  },
  scanButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Categories
  categoriesScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 12,
  },
  categoriesRow: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  catTab: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTabActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  catText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    lineHeight: 16,
  },
  catTextActive: {
    color: C.white,
  },

  // Loading
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Grid
  flatList: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: 11,
    paddingBottom: 100,
    flexGrow: 1,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
  },

  // Cart bar
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    gap: 12,
  },
  cartIconWrap: {
    position: 'relative',
  },
  cartCount: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: {
    color: C.white,
    fontSize: 10,
    fontWeight: '700',
  },
  cartInfo: {
    flex: 1,
  },
  cartLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '500',
  },
  cartTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
  },
  payButton: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
