import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './StockTransferColors';
import { styles } from './NewTransferSheet.styles';

interface TransferActionsProps {
  readonly loading: boolean;
  readonly onCancel: () => void;
  readonly onSubmit: () => void;
}

export default function TransferActions({ loading, onCancel, onSubmit }: TransferActionsProps) {
  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={onCancel}
        disabled={loading}
      >
        <Text style={styles.cancelBtnText}>Bekor</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={C.white} size="small" />
        ) : (
          <>
            <Ionicons name="swap-horizontal-outline" size={16} color={C.white} />
            <Text style={styles.submitBtnText}>O'tkazish</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
