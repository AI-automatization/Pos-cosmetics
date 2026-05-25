import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { C } from './StockTransferColors';
import { styles } from './NewTransferSheet.styles';
import type { Branch } from '../../api/branches.api';

interface BranchChipSelectorProps {
  readonly label: string;
  readonly branches: Branch[];
  readonly isLoading: boolean;
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
  readonly disabled?: boolean;
  readonly disabledId?: string;
  readonly showTopMargin?: boolean;
}

export default function BranchChipSelector({
  label,
  branches,
  isLoading,
  selectedId,
  onSelect,
  disabled = false,
  disabledId,
  showTopMargin = false,
}: BranchChipSelectorProps) {
  return (
    <>
      <Text style={[styles.label, showTopMargin && styles.labelTop]}>{label}</Text>
      {isLoading ? (
        <ActivityIndicator size="small" color={C.primary} style={styles.branchLoader} />
      ) : (
        <View style={styles.chipRow}>
          {branches.map((b) => {
            const isDisabled = disabledId === b.id;
            return (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.chip,
                  selectedId === b.id && styles.chipActive,
                  isDisabled && styles.chipSameDisabled,
                ]}
                onPress={() => onSelect(b.id)}
                disabled={disabled || isDisabled}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedId === b.id && styles.chipTextActive,
                    isDisabled && styles.chipTextDisabled,
                  ]}
                  numberOfLines={1}
                >
                  {b.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </>
  );
}
