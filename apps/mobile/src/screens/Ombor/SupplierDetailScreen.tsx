import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../../api/catalog.api';
import type { SupplierDetail } from '../../api/catalog.api';
import type { OmborTabStackParamList } from '../../navigation/types';
import { InfoRow, StatusBadge, ProductRow } from './SupplierDetailParts';
import type { LinkedProduct } from './SupplierDetailParts';
import NewSupplierSheet from './NewSupplierSheet';
import { C } from './OmborColors';

// ─── Navigation types ───────────────────────────────────
type RouteType = RouteProp<OmborTabStackParamList, 'SupplierDetailScreen'>;
type NavType = NativeStackNavigationProp<OmborTabStackParamList, 'SupplierDetailScreen'>;

// ─── SupplierDetailScreen ───────────────────────────────
export default function SupplierDetailScreen(): React.JSX.Element {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<NavType>();
  const queryClient = useQueryClient();
  const { supplierId } = route.params;

  const [showEdit, setShowEdit] = useState(false);

  // ── Data ──────────────────────────────────────────────
  const supplier = useQuery<SupplierDetail>({
    queryKey: ['supplier-detail', supplierId],
    queryFn: () => catalogApi.getSupplierById(supplierId),
    staleTime: 60_000,
  });

  // ── Toggle active ─────────────────────────────────────
  const toggleActive = useMutation({
    mutationFn: () =>
      catalogApi.updateSupplier(supplierId, { isActive: !supplier.data?.isActive }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['supplier-detail', supplierId] });
      void queryClient.invalidateQueries({ queryKey: ['ombor-suppliers'] });
      void queryClient.invalidateQueries({ queryKey: ['catalog-suppliers'] });
    },
  });

  const handleToggle = useCallback(() => {
    if (!supplier.data) return;
    if (supplier.data.isActive) {
      Alert.alert(
        'Nofaol qilish',
        `"${supplier.data.name}" nofaol qilinsinmi?`,
        [
          { text: 'Bekor', style: 'cancel' },
          { text: 'Ha', onPress: () => toggleActive.mutate() },
        ],
      );
    } else {
      toggleActive.mutate();
    }
  }, [supplier.data, toggleActive]);

  const handlePhone = useCallback(() => {
    const phone = supplier.data?.phone;
    if (phone) {
      void Linking.openURL(`tel:${phone}`);
    }
  }, [supplier.data?.phone]);

  const handleEditSuccess = useCallback(() => {
    setShowEdit(false);
    void queryClient.invalidateQueries({ queryKey: ['supplier-detail', supplierId] });
    void queryClient.invalidateQueries({ queryKey: ['ombor-suppliers'] });
    void queryClient.invalidateQueries({ queryKey: ['catalog-suppliers'] });
  }, [queryClient, supplierId]);

  // ── Derived data ──────────────────────────────────────
  const products: LinkedProduct[] = (supplier.data?.productSuppliers ?? []).map(
    (ps) => ps.product,
  );
  const isActive = supplier.data?.isActive ?? true;

  // ── Loading ───────────────────────────────────────────
  if (supplier.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ─────────────────────────────────────────────
  if (supplier.error || !supplier.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xatolik</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyWrap}>
          <Ionicons name="cloud-offline-outline" size={48} color={C.muted} />
          <Text style={styles.emptyText}>Ma'lumot yuklanmadi</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Header content for FlatList ───────────────────────
  const headerComponent = (
    <>
      <View style={styles.infoCard}>
        <InfoRow label="Kompaniya" value={supplier.data.company ?? '\u2014'} />
        <InfoRow
          label="Telefon"
          value={supplier.data.phone ?? '\u2014'}
          onPress={supplier.data.phone ? handlePhone : undefined}
        />
        <InfoRow label="Manzil" value={supplier.data.address ?? '\u2014'} />
        <InfoRow
          label="Holat"
          isLast
          rightElement={<StatusBadge isActive={isActive} />}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bog'liq mahsulotlar</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{products.length}</Text>
        </View>
      </View>

      {products.length === 0 && (
        <View style={styles.emptyProducts}>
          <Ionicons name="cube-outline" size={36} color={C.muted} />
          <Text style={styles.emptyProductsText}>Hali mahsulot bog'lanmagan</Text>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {supplier.data.name}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setShowEdit(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={18} color={C.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleToggle}
            activeOpacity={0.7}
            disabled={toggleActive.isPending}
          >
            {toggleActive.isPending ? (
              <ActivityIndicator size="small" color={C.muted} />
            ) : (
              <Ionicons
                name={isActive ? 'pause-circle-outline' : 'play-circle-outline'}
                size={18}
                color={isActive ? C.orange : C.green}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Products list */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductRow item={item} />}
        ListHeaderComponent={headerComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Edit sheet */}
      <NewSupplierSheet
        visible={showEdit}
        supplier={supplier.data}
        onClose={() => setShowEdit(false)}
        onSuccess={handleEditSuccess}
      />
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: { width: 36 },

  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    padding: 16,
    paddingBottom: 40,
  },

  infoCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  countBadge: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.white,
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
    fontWeight: '600',
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyProductsText: {
    fontSize: 14,
    color: C.muted,
  },
});
