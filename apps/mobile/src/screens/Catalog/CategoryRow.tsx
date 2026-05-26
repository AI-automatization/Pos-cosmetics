import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CatalogCategory } from '../../api/catalog.api';
import { C, styles } from './CategoriesScreen.styles';

// ─── Tree node ─────────────────────────────────────────
export interface TreeNode extends CatalogCategory {
  children: TreeNode[];
}

export function buildTree(categories: CatalogCategory[]): TreeNode[] {
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

// ─── Flat list item type ───────────────────────────────
export interface FlatItem {
  node: TreeNode;
  depth: number;
}

// ─── CategoryRow ───────────────────────────────────────
interface CategoryRowProps {
  readonly category: TreeNode;
  readonly depth: number;
  readonly onEdit: (c: CatalogCategory) => void;
  readonly onDelete: (c: TreeNode) => void;
}

export default function CategoryRow({ category, depth, onEdit, onDelete }: CategoryRowProps) {
  const childCount = category.children.length;
  const paddingLeft = 16 + depth * 20;

  const handleMenu = () => {
    Alert.alert(category.name, undefined, [
      { text: 'Tahrirlash', onPress: () => onEdit(category) },
      {
        text: "O'chirish",
        style: 'destructive',
        onPress: () => onDelete(category),
      },
      { text: 'Bekor qilish', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.row, depth > 0 && styles.rowChild, { paddingLeft }]}>
      {depth > 0 && (
        <View style={[styles.indentLine, { left: paddingLeft - 12 }]} />
      )}
      <View style={[styles.folderIcon, depth > 0 && styles.folderIconChild]}>
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
