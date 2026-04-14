import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from './utils';

interface Category {
  readonly id: string;
  readonly name: string;
}

interface CategoryTabsProps {
  readonly categories: Category[];
  readonly activeCategory: string;
  readonly onSelect: (id: string) => void;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
}: CategoryTabsProps) {
  return (
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
          onPress={() => onSelect(cat.id)}
          activeOpacity={0.75}
        >
          <Text style={[styles.catText, activeCategory === cat.id && styles.catTextActive]}>
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTabActive: {
    backgroundColor: C.primary,
  },
  catText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 16,
  },
  catTextActive: {
    color: C.white,
  },
});
