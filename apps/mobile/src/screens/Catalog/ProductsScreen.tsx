import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
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
import { canEditCatalog } from '@/utils/roles';
import { LabelPrintSheet } from './LabelPrintSheet';
import { ProductListCard } from './ProductListCard';
import { styles, C } from './ProductsScreen.styles';

// ─── Filter types ──────────────────────────────────────
type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
const STAT_FILTERS: { key: ActiveFilter; label: string }[] = [
  { key: 'ALL',      label: 'Jami' },
  { key: 'ACTIVE',   label: 'Faol' },
  { key: 'INACTIVE', label: 'Nofaol' },
];

// ─── Types ─────────────────────────────────────────────
type CatalogNavProp = NativeStackNavigationProp<CatalogStackParamList>;

// ─── ProductsScreen ────────────────────────────────────
const DELETABLE_ROLES = ['OWNER', 'ADMIN', 'MANAGER'] as const;

export default function ProductsScreen() {
  const [search, setSearch]           = useState('');
  const [categoryId, setCategoryId]   = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('ALL');
  const [printProduct, setPrintProduct] = useState<CatalogProduct | null>(null);

  const navigation = useNavigation<CatalogNavProp>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canDelete = DELETABLE_ROLES.includes(
    (user?.role ?? '') as typeof DELETABLE_ROLES[number],
  );
  const canEdit = canEditCatalog(user?.role);

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

  const handlePrint = (p: CatalogProduct) => {
    setPrintProduct(p);
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
              onPrint={handlePrint}
              canEdit={canEdit}
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
      {canEdit && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ProductForm', undefined)}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Etiketka chop sheet */}
      <LabelPrintSheet
        product={printProduct}
        onClose={() => setPrintProduct(null)}
      />
    </SafeAreaView>
  );
}
