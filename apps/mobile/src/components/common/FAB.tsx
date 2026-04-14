import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius } from '@/theme';

interface FABProps {
  readonly onPress: () => void;
  /** Custom icon element — defaults to add/plus icon */
  readonly icon?: React.ReactNode;
  readonly style?: ViewStyle;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
}

export default function FAB({
  onPress,
  icon,
  style,
  loading = false,
  disabled = false,
  accessibilityLabel = 'Yangi element qo\'shish',
}: FABProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.fab, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.surface} />
      ) : (
        icon ?? (
          <Ionicons name="add" size={28} color={colors.surface} />
        )
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  disabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
});
