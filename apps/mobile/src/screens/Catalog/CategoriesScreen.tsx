import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { catalogApi, type CatalogCategory } from '../../api/catalog.api';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  red:     '#DC2626',
};

// ─── Tree node ─────────────────────────────────────────
interface TreeNode extends CatalogCategory {
  children: CatalogCategory[];
}

function buildTree(categories: CatalogCategory[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  categories.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

// ─── CategoryFormSheet ─────────────────────────────────
function CategoryFormSheet({
  visible,
  categories,
  editCategory,
  onClose,
}: {
  visible: boolean;
  categories: CatalogCategory[];
  editCategory: CatalogCategory | null;
  onClose: () => void;
}) {
  const [name, setName]       = useState(editCategory?.name ?? '');
  const [parentId, setParentId] = useState<string | null>(editCategory?.parentId ?? null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setName(editCategory?.name ?? '');
      setParentId(editCategory?.parentId ?? null);
    }
  }, [visible, editCategory]);

  const parentName = categories.find((c) => c.id === parentId)?.name ?? null;

  const handleParentPick = () => {
    const roots = categories.filter((c) => !c.parentId && c.id !== editCategory?.id);
    Alert.alert('Ota kategoriyani tanlang', undefined, [
      { text: "Yo'q (asosiy)", onPress: () => setParentId(null) },
      ...roots.map((c) => ({ text: c.name, onPress: () => setParentId(c.id) })),
      { text: 'Bekor qilish', style: 'cancel' as const },
    ]);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Muvaffaqiyat',
        `"${name}" ${editCategory ? 'yangilandi' : 'qo\'shildi'}`,
        [{ text: 'OK', onPress: onClose }],
      );
    }, 600);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={sheet.backdrop} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={sheet.wrapper}
      >
        <View style={sheet.panel}>
          <View style={sheet.handle} />

          <View style={sheet.header}>
            <View style={sheet.iconCircle}>
              <Ionicons name="folder-outline" size={22} color={C.primary} />
            </View>
            <Text style={sheet.title}>
              {editCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
            </Text>
          </View>

          <Text style={sheet.fieldLabel}>KATEGORIYA NOMI *</Text>
          <TextInput
            style={sheet.input}
            value={name}
            onChangeText={setName}
            placeholder="Masalan: Kremlar"
            placeholderTextColor={C.muted}
            autoFocus={visible}
          />

          <Text style={sheet.fieldLabel}>OTA KATEGORIYA</Text>
          <TouchableOpacity style={sheet.selectRow} onPress={handleParentPick}>
            <Ionicons name="folder-open-outline" size={18} color={C.muted} />
            <Text style={[sheet.selectText, !parentName && sheet.selectPlaceholder]}>
              {parentName ?? "Yo'q (asosiy kategoriya)"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[sheet.saveBtn, !name.trim() && sheet.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!name.trim() || loading}
          >
            {loading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={sheet.saveBtnText}>
                  {editCategory ? 'Saqlash' : "Qo'shish"}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── CategoryRow ───────────────────────────────────────
function CategoryRow({
  category,
  isChild,
  onEdit,
  onDelete,
}: {
  category: TreeNode;
  isChild: boolean;
  onEdit: (c: CatalogCategory) => void;
  onDelete: (c: CatalogCategory) => void;
}) {
  const childCount = category.children.length;

  const handleMenu = () => {
    Alert.alert(category.name, undefined, [
      { text: 'Tahrirlash', onPress: () => onEdit(category) },
      {
        text: "O'chirish",
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            "O'chirishni tasdiqlang",
            `"${category.name}" o'chirilsinmi?${childCount > 0 ? `\n${childCount} ta sub-kategoriya ham o'chadi.` : ''}`,
            [
              { text: 'Bekor', style: 'cancel' },
              { text: "O'chirish", style: 'destructive', onPress: () => onDelete(category) },
            ],
          );
        },
      },
      { text: 'Bekor qilish', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.row, isChild && styles.rowChild]}>
      {isChild && <View style={styles.indentLine} />}
      <View style={[styles.folderIcon, isChild && styles.folderIconChild]}>
        <Ionicons
          name={childCount > 0 ? 'folder' : 'folder-outline'}
          size={20}
          color={childCount > 0 ? '#D97706' : C.muted}
        />
      </View>
      <Text style={styles.catName} numberOfLines={1}>{category.name}</Text>
      {childCount > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{childCount}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.menuBtn} onPress={handleMenu} activeOpacity={0.7}>
        <Ionicons name="ellipsis-vertical" size={16} color={C.muted} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Flat list item type ───────────────────────────────
interface FlatItem {
  node: TreeNode;
  isChild: boolean;
}

// ─── CategoriesScreen ──────────────────────────────────
export default function CategoriesScreen() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editCategory, setEditCategory] = useState<CatalogCategory | null>(null);

  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: catalogApi.getCategories,
    staleTime: 5 * 60_000,
  });

  const tree = useMemo(() => buildTree(categories), [categories]);

  // Flatten tree: root → children → next root → ...
  const flatItems = useMemo<FlatItem[]>(() => {
    const result: FlatItem[] = [];
    tree.forEach((root) => {
      result.push({ node: root, isChild: false });
      root.children.forEach((child) =>
        result.push({ node: { ...child, children: [] }, isChild: true }),
      );
    });
    return result;
  }, [tree]);

  const handleEdit = (c: CatalogCategory) => {
    setEditCategory(c);
    setSheetVisible(true);
  };

  const handleDelete = (_c: CatalogCategory) => {
    void refetch();
  };

  const handleAdd = () => {
    setEditCategory(null);
    setSheetVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
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
              category={item.node as TreeNode}
              isChild={item.isChild}
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
        onClose={() => setSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Sheet styles ───────────────────────────────────────
const sheet = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  panel: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center', marginBottom: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconCircle: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '800', color: C.text },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, marginBottom: 8,
  },
  input: {
    height: 50, backgroundColor: C.bg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, fontSize: 15, color: C.text,
    marginBottom: 16,
  },
  selectRow: {
    height: 50, backgroundColor: C.bg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, flexDirection: 'row',
    alignItems: 'center', gap: 10, marginBottom: 20,
  },
  selectText: { flex: 1, fontSize: 15, color: C.text },
  selectPlaceholder: { color: C.muted },
  saveBtn: {
    backgroundColor: C.primary, borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnDisabled: { backgroundColor: '#E5E7EB', shadowOpacity: 0, elevation: 0 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

// ─── Screen styles ──────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerCount: { fontSize: 12, color: C.muted, marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },
  loader: { flex: 1 },
  listContent: { paddingVertical: 8, paddingBottom: 40 },
  separator: { height: 1, backgroundColor: C.border, marginLeft: 64 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, gap: 12,
  },
  rowChild: { paddingLeft: 32, backgroundColor: C.bg },
  indentLine: {
    position: 'absolute', left: 28, top: 0, bottom: 0,
    width: 1.5, backgroundColor: C.border,
  },
  folderIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center',
  },
  folderIconChild: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  catName: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  countBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: '#EFF6FF', borderRadius: 20,
  },
  countText: { fontSize: 12, fontWeight: '700', color: C.primary },
  menuBtn: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: C.muted, fontWeight: '600' },
  emptyBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: C.primary, borderRadius: 10,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
