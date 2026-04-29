import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { catalogApi, type CatalogProduct, type CatalogCategory } from '../../api/catalog.api';
import SearchBar from '../../components/common/SearchBar';
import { useAuthStore } from '../../store/auth.store';
import type { CatalogStackParamList } from '../../navigation/types';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
  orange:  '#D97706',
  red:     '#DC2626',
};

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString('ru-RU'); }

type StockStatus = 'OK' | 'KAM' | 'TUGAGAN';

function stockStatus(qty: number, min: number): StockStatus {
  if (qty === 0) return 'TUGAGAN';
  if (qty <= min) return 'KAM';
  return 'OK';
}

const STOCK_STYLE: Record<StockStatus, { bg: string; text: string }> = {
  OK:      { bg: '#D1FAE5', text: '#16A34A' },
  KAM:     { bg: '#FEF3C7', text: '#D97706' },
  TUGAGAN: { bg: '#FEE2E2', text: '#DC2626' },
};

// ─── Filter types ──────────────────────────────────────
type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
const STAT_FILTERS: { key: ActiveFilter; label: string }[] = [
  { key: 'ALL',      label: 'Jami' },
  { key: 'ACTIVE',   label: 'Faol' },
  { key: 'INACTIVE', label: 'Nofaol' },
];

// ─── ProductListCard ───────────────────────────────────
function ProductListCard({
  product,
  onEdit,
  onDelete,
}: {
  product: CatalogProduct;
  onEdit: (p: CatalogProduct) => void;
  onDelete: (p: CatalogProduct) => void;
}) {
  const status = stockStatus(product.stockQuantity, product.minStockLevel);
  const stock = STOCK_STYLE[status];
  const initials = product.name.slice(0, 2).toUpperCase();
  const margin = product.costPrice > 0
    ? Math.round(((product.sellPrice - product.costPrice) / product.costPrice) * 100)
    : 0;

  const handleMenu = () => {
    Alert.alert(product.name, undefined, [
      { text: 'Tahrirlash', onPress: () => onEdit(product) },
      { text: "O'chirish", style: 'destructive', onPress: () => onDelete(product) },
      { text: 'Bekor qilish', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.card}>
      {/* Image placeholder */}
      <View style={[styles.imgBox, { backgroundColor: '#EFF6FF' }]}>
        <Text style={styles.imgInitials}>{initials}</Text>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.productSku}>
          {product.sku}
          {product.categoryName ? `  ·  ${product.categoryName}` : ''}
        </Text>
        <View style={styles.cardBottom}>
          <Text style={styles.productPrice}>{fmt(product.sellPrice)} UZS</Text>
          <View style={[styles.stockBadge, { backgroundColor: stock.bg }]}>
            <Text style={[styles.stockText, { color: stock.text }]}>{status}</Text>
          </View>
          {margin > 0 && (
            <View style={styles.marginBadge}>
              <Text style={styles.marginText}>+{margin}%</Text>
            </View>
          )}
        </View>
      </View>

      {/* Menu button */}
      <TouchableOpacity style={styles.menuBtn} onPress={handleMenu} activeOpacity={0.7}>
        <Ionicons name="ellipsis-vertical" size={18} color={C.muted} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Types ─────────────────────────────────────────────
type CatalogNavProp = NativeStackNavigationProp<CatalogStackParamList>;

// ─── ProductsScreen ────────────────────────────────────
const DELETABLE_ROLES = ['OWNER', 'ADMIN', 'MANAGER'] as const;

export default function ProductsScreen() {
  const [search, setSearch]           = useState('');
  const [categoryId, setCategoryId]   = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('ALL');

  const navigation = useNavigation<CatalogNavProp>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canDelete = DELETABLE_ROLES.includes(
    (user?.role ?? '') as typeof DELETABLE_ROLES[number],
  );

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: () => catalogApi.getProducts({ limit: 500 }),
    staleTime: 60_000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: catalogApi.getCategories,
    staleTime: 5 * 60_000,
  });

  // Stats
  const totalCount    = products.length;
  const activeCount   = products.filter((p) => p.isActive).length;
  const inactiveCount = totalCount - activeCount;

  // Filtered list
  const filtered = useMemo(() => {
    let list = products;
    if (activeFilter === 'ACTIVE')   list = list.filter((p) => p.isActive);
    if (activeFilter === 'INACTIVE') list = list.filter((p) => !p.isActive);
    if (categoryId) list = list.filter((p) => p.categoryId === categoryId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode ?? '').includes(q),
      );
    }
    return list;
  }, [products, activeFilter, categoryId, search]);

  const handleEdit = (p: CatalogProduct) => {
    navigation.navigate('ProductForm', { productId: p.id });
  };

  const handleDelete = (p: CatalogProduct) => {
    if (!canDelete) {
      Alert.alert('Ruxsat yo\'q', 'Mahsulot o\'chirish uchun admin ruxsati kerak.');
      return;
    }
    Alert.alert(
      'O\'chirish',
      `"${p.name}" o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.`,
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: () => {
            catalogApi.deleteProduct(p.id)
              .then(() => {
                void queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
              })
              .catch(() => {
                Alert.alert('Xatolik', 'Mahsulotni o\'chirishda xatolik yuz berdi.');
              });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mahsulotlar</Text>
          <Text style={styles.headerCount}>{totalCount} ta mahsulot</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="filter-outline" size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* SearchBar */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Mahsulot nomi yoki SKU..."
        />
      </View>

      {/* Category pills */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catScroll}
          contentContainerStyle={styles.catRow}
        >
          <TouchableOpacity
            style={[styles.catPill, !categoryId && styles.catPillActive]}
            onPress={() => setCategoryId(null)}
          >
            <Text style={[styles.catText, !categoryId && styles.catTextActive]}>Barchasi</Text>
          </TouchableOpacity>
          {categories.map((cat: CatalogCategory) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catPill, categoryId === cat.id && styles.catPillActive]}
              onPress={() => setCategoryId(cat.id)}
            >
              <Text style={[styles.catText, categoryId === cat.id && styles.catTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Stats chips */}
      <View style={styles.statsRow}>
        {STAT_FILTERS.map((f) => {
          const count = f.key === 'ALL' ? totalCount : f.key === 'ACTIVE' ? activeCount : inactiveCount;
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.statChip, isActive && styles.statChipActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.statChipLabel, isActive && styles.statChipLabelActive]}>
                {f.label}
              </Text>
              <Text style={[styles.statChipCount, isActive && styles.statChipCountActive]}>
                {count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color={C.primary} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <ProductListCard
              product={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={44} color={C.muted} />
              <Text style={styles.emptyText}>Mahsulot topilmadi</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProductForm', undefined)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerCount: { fontSize: 12, color: C.muted, marginTop: 2 },
  headerIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  searchWrap: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  catScroll: { flexGrow: 0, backgroundColor: C.white },
  catRow: {
    paddingHorizontal: 16, paddingVertical: 8, gap: 8,
  },
  catPill: {
    height: 30, paddingHorizontal: 14, borderRadius: 15,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  catPillActive: { backgroundColor: '#2563EB' },
  catText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  catTextActive: { color: '#FFFFFF' },
  statsRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8,
  },
  statChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, borderRadius: 10,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
  },
  statChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  statChipLabel: { fontSize: 12, fontWeight: '600', color: C.muted },
  statChipLabelActive: { color: '#2563EB' },
  statChipCount: { fontSize: 14, fontWeight: '800', color: C.text },
  statChipCountActive: { color: '#2563EB' },
  loader: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 100 },
  separator: { height: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 12, gap: 12,
  },
  imgBox: {
    width: 60, height: 60, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  imgInitials: {
    fontSize: 20, fontWeight: '800', color: '#2563EB',
    opacity: 0.5,
  },
  cardInfo: { flex: 1, gap: 3 },
  productName: { fontSize: 15, fontWeight: '600', color: C.text },
  productSku: {
    fontSize: 12, color: C.muted,
    fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }),
  },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  productPrice: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  stockText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  marginBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20,
    backgroundColor: '#F0FDF4',
  },
  marginText: { fontSize: 10, fontWeight: '700', color: '#16A34A' },
  menuBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
});
