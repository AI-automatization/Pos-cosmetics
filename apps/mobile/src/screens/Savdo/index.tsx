import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import ProductCard, { Product } from './ProductCard';
import ScannerModal from './ScannerModal';
import PaymentSheet, { type PaymentMethod } from './PaymentSheet';

// ─── Ranglar ───────────────────────────────────────────
const C = {
  primary: '#5B5BD6',
  bg: '#F5F5F7',
  white: '#FFFFFF',
  text: '#111827',
  muted: '#9CA3AF',
  border: '#E5E7EB',
};

// ─── Mock ma'lumotlar ───────────────────────────────────
const CATEGORIES = [
  { id: 'all', name: 'Hammasi' },
  { id: 'yuz', name: 'Yuz' },
  { id: 'soch', name: 'Soch' },
  { id: 'tana', name: 'Tana' },
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: "Chanel N°5 Eau de Parfum",     sellPrice: 1_200_000, categoryId: 'tana', stockQty: 15, minStockLevel: 5,  placeholderColor: '#F5E6C8' },
  { id: '2', name: "Nivea Soft Moisturizing",        sellPrice:    85_000, categoryId: 'yuz',  stockQty: 2,  minStockLevel: 5,  placeholderColor: '#F5D5E0' },
  { id: '3', name: "L'Oreal Professional Shampoo",   sellPrice:    45_000, categoryId: 'soch', stockQty: 0,  minStockLevel: 5,  placeholderColor: '#E8E8F5' },
  { id: '4', name: "Vaseline Intensive Care",         sellPrice:   120_000, categoryId: 'tana', stockQty: 40, minStockLevel: 10, placeholderColor: '#D5E8F5' },
  { id: '5', name: "Neutrogena Hand Cream",           sellPrice:    35_000, categoryId: 'tana', stockQty: 12, minStockLevel: 5,  placeholderColor: '#E8F5E8' },
  { id: '6', name: "Garnier Micellar Water",          sellPrice:    55_000, categoryId: 'yuz',  stockQty: 8,  minStockLevel: 3,  placeholderColor: '#FFF0E0' },
  { id: '7', name: "Pantene Pro-V Conditioner",       sellPrice:    38_000, categoryId: 'soch', stockQty: 3,  minStockLevel: 5,  placeholderColor: '#E0F0FF' },
  { id: '8', name: "Dove Body Lotion",                sellPrice:    42_000, categoryId: 'tana', stockQty: 22, minStockLevel: 5,  placeholderColor: '#F0FFE0' },
];

// ─── Cart item ─────────────────────────────────────────
interface CartItem {
  product: Product;
  qty: number;
}

function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}

// ─── Screen ────────────────────────────────────────────
export default function SavdoScreen() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);

  // Filtered products
  const products = useMemo(() => {
    return MOCK_PRODUCTS.filter((p) => {
      const matchCat = activeCategory === 'all' || p.categoryId === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  // Cart helpers
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

  const handleScanned = (barcode: string) => {
    setScannerVisible(false);
    // Barkod bo'yicha mahsulot qidirish (hozircha name bo'yicha)
    const found = MOCK_PRODUCTS.find(
      (p) => p.id === barcode || p.name.toLowerCase().includes(barcode.toLowerCase()),
    );
    if (found) {
      setActiveCategory('all');
      setSearch(found.name);
    } else {
      setSearch(barcode);
    }
  };

  const cartQty = (productId: string) =>
    cart.find((i) => i.product.id === productId)?.qty ?? 0;

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.product.sellPrice * i.qty, 0);

  // ─── Render ───────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Savdo</Text>
        <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color={C.text} />
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
        {CATEGORIES.map((cat) => (
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
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Mahsulot topilmadi</Text>
          </View>
        }
      />

      {/* Payment sheet */}
      <PaymentSheet
        visible={paymentVisible}
        cart={cart}
        total={totalPrice}
        onClose={() => setPaymentVisible(false)}
        onConfirm={(_method: PaymentMethod, _received: number) => {
          setPaymentVisible(false);
          setCart([]);
        }}
      />

      {/* Scanner modal */}
      <ScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanned={handleScanned}
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

          <TouchableOpacity
            style={styles.payButton}
            activeOpacity={0.85}
            onPress={() => setPaymentVisible(true)}
          >
            <Text style={styles.payButtonText}>To'lov  →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
    backgroundColor: '#EF4444',
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
  },
  payButtonText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
