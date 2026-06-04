import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { catalogApi, type Supplier, type CreateSupplierDto, type UpdateSupplierDto } from '../../api/catalog.api';
import type { CatalogStackParamList } from '../../navigation/types';
import { extractErrorMessage } from '../../utils/error';
import SearchBar from '../../components/common/SearchBar';
import SupplierFormSheet from './SupplierFormSheet';
import SupplierCard from './SupplierCard';
import { C, styles } from './SuppliersScreen.styles';

// ─── SuppliersScreen ───────────────────────────────────
export default function SuppliersScreen() {
  const qc = useQueryClient();
  const navigation = useNavigation<NativeStackNavigationProp<CatalogStackParamList>>();
  const [search, setSearch]             = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  // ── Fetch ──────────────────────────────────────────────
  const { data: suppliers = [], isLoading, error } = useQuery<Supplier[]>({
    queryKey: ['catalog-suppliers'],
    queryFn: catalogApi.getSuppliers,
    staleTime: 2 * 60_000,
  });

  // ── Mutations ──────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (dto: CreateSupplierDto) => catalogApi.createSupplier(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['catalog-suppliers'] });
      setSheetVisible(false);
    },
    onError: (err: unknown) => {
      Alert.alert('Xatolik', extractErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSupplierDto }) =>
      catalogApi.updateSupplier(id, dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['catalog-suppliers'] });
      setSheetVisible(false);
    },
    onError: (err: unknown) => {
      Alert.alert('Xatolik', extractErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogApi.deleteSupplier(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['catalog-suppliers'] });
    },
    onError: (err: unknown) => {
      Alert.alert('Xatolik', extractErrorMessage(err));
    },
  });

  // ── Derived ────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return suppliers;
    const q = search.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.company ?? '').toLowerCase().includes(q) ||
        (s.phone ?? '').includes(q),
    );
  }, [suppliers, search]);

  // ── Handlers ───────────────────────────────────────────
  const handleAdd = () => {
    setEditSupplier(null);
    setSheetVisible(true);
  };

  const handleEdit = (s: Supplier) => {
    setEditSupplier(s);
    setSheetVisible(true);
  };

  const handleDelete = (s: Supplier) => {
    deleteMutation.mutate(s.id);
  };

  const handleSave = (dto: CreateSupplierDto | UpdateSupplierDto) => {
    if (editSupplier) {
      updateMutation.mutate({ id: editSupplier.id, dto });
    } else {
      createMutation.mutate(dto as CreateSupplierDto);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Render ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Orqaga"
          >
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.headerTitle}>Yetkazib beruvchilar</Text>
          <Text style={styles.headerCount}>{suppliers.length} ta</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* SearchBar */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Ism, kompaniya yoki telefon..."
        />
      </View>

      {/* Loading */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color={C.primary} />
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="cloud-offline-outline" size={44} color={C.muted} />
          <Text style={styles.emptyTitle}>Ma'lumot yuklanmadi</Text>
          <Text style={styles.errorText}>{extractErrorMessage(error)}</Text>
        </View>
      ) : (
        /* List */
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <SupplierCard
              supplier={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="business-outline" size={44} color={C.muted} />
              <Text style={styles.emptyTitle}>
                {search ? 'Topilmadi' : "Yetkazib beruvchilar yo'q"}
              </Text>
              {!search && (
                <TouchableOpacity style={styles.emptyBtn} onPress={handleAdd}>
                  <Text style={styles.emptyBtnText}>Birinchisini qo'shish</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      <SupplierFormSheet
        visible={sheetVisible}
        supplier={editSupplier}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </SafeAreaView>
  );
}
