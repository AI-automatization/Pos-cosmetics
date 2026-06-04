import React, { useMemo, useState } from 'react';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { catalogApi, type CatalogCategory } from '../../api/catalog.api';
import type { CatalogStackParamList } from '../../navigation/types';
import CategoryFormSheet from './CategoryFormSheet';
import CategoryRow, { buildTree, type TreeNode, type FlatItem } from './CategoryRow';
import { C, styles } from './CategoriesScreen.styles';

// ─── CategoriesScreen ──────────────────────────────────
const QUERY_KEY = ['catalog-categories'];

export default function CategoriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CatalogStackParamList>>();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editCategory, setEditCategory] = useState<CatalogCategory | null>(null);

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: catalogApi.getCategories,
    staleTime: 5 * 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (dto: { name: string; parentId?: string | null }) =>
      catalogApi.createCategory(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setSheetVisible(false);
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Xatolik yuz berdi';
      Alert.alert('Xatolik', msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name: string; parentId?: string | null } }) =>
      catalogApi.updateCategory(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setSheetVisible(false);
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Xatolik yuz berdi';
      Alert.alert('Xatolik', msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogApi.deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Xatolik yuz berdi';
      Alert.alert('Xatolik', msg);
    },
  });

  const tree = useMemo(() => buildTree(categories), [categories]);

  // Flatten tree: unlimited depth, recursive
  const flatItems = useMemo<FlatItem[]>(() => {
    const result: FlatItem[] = [];
    function flatten(nodes: TreeNode[], depth: number): void {
      nodes.forEach((node) => {
        result.push({ node, depth });
        if (node.children.length > 0) flatten(node.children, depth + 1);
      });
    }
    flatten(tree, 0);
    return result;
  }, [tree]);

  const handleEdit = (c: CatalogCategory) => {
    setEditCategory(c);
    setSheetVisible(true);
  };

  const handleDelete = (category: TreeNode) => {
    Alert.alert(
      "O'chirish",
      `"${category.name}" kategoriyasini o'chirishni tasdiqlaysizmi?`,
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: () => deleteMutation.mutate(category.id),
        },
      ],
    );
  };

  const handleSave = (name: string, parentId: string | null) => {
    if (editCategory) {
      updateMutation.mutate({ id: editCategory.id, dto: { name, parentId } });
    } else {
      createMutation.mutate({ name, parentId });
    }
  };

  const handleAdd = () => {
    setEditCategory(null);
    setSheetVisible(true);
  };

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
          <Text style={styles.headerTitle}>Kategoriyalar</Text>
          <Text style={styles.headerCount}>{categories.length} ta</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.8}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color={C.primary} />
      ) : (
        <FlatList
          data={flatItems}
          keyExtractor={(item) => item.node.id}
          renderItem={({ item }) => (
            <CategoryRow
              category={item.node}
              depth={item.depth}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="folder-open-outline" size={44} color={C.muted} />
              <Text style={styles.emptyText}>Kategoriyalar yo'q</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={handleAdd}>
                <Text style={styles.emptyBtnText}>Birinchisini qo'shish</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <CategoryFormSheet
        visible={sheetVisible}
        categories={categories}
        editCategory={editCategory}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => setSheetVisible(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}
