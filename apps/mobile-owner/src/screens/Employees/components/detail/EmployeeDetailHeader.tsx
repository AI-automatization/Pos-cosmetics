import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows } from '../../../../config/theme';

interface EmployeeDetailHeaderProps {
  readonly employeeName: string;
  readonly onBack: () => void;
}

export default function EmployeeDetailHeader({ employeeName, onBack }: EmployeeDetailHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>{employeeName}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    paddingTop: 52,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.card,
  },
  backBtn: {
    width: 38,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    ...Typography.h4,
    color: Colors.primary,
    textAlign: 'center',
  },
  spacer: {
    width: 38,
  },
});
