import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, Typography } from '../../config/theme';

interface PnLHeaderProps {
  readonly onBack: () => void;
}

export default function PnLHeader({ onBack }: PnLHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Foyda va zarar (P&amp;L)</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.card,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.primary,
    flex: 1,
  },
  headerSpacer: { width: 34 },
});
