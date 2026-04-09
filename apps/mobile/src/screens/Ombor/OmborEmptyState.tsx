// Ombor screen — EmptyState component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C } from './OmborColors';

export default function OmborEmptyState() {
  return (
    <View style={styles.empty}>
      <MaterialCommunityIcons name="package-variant-closed" size={48} color={C.muted} />
      <Text style={styles.emptyText}>Mahsulot topilmadi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: C.muted,
  },
});
