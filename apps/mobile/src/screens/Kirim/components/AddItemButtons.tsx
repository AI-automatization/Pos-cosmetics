import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from './types';

interface AddItemButtonsProps {
  loading: boolean;
  onScanPress: () => void;
  onManualPress: () => void;
}

export default function AddItemButtons({
  loading,
  onScanPress,
  onManualPress,
}: AddItemButtonsProps) {
  return (
    <View style={styles.addButtonsRow}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={onScanPress}
        disabled={loading}
      >
        <Text style={styles.addButtonText}>Barkod skan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.addButton, styles.addButtonSecondary]}
        onPress={onManualPress}
        disabled={loading}
      >
        <Text style={[styles.addButtonText, styles.addButtonTextSecondary]}>
          Qo'lda kiritish
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  addButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonSecondary: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.primary,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.white,
  },
  addButtonTextSecondary: {
    color: C.primary,
  },
});
