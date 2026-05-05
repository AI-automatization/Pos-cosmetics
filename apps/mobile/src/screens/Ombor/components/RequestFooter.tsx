import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './types';

interface RequestFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

export default function RequestFooter({ onCancel, onSubmit, loading = false }: RequestFooterProps) {
  return (
    <View style={styles.footer}>
      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          activeOpacity={0.75}
          disabled={loading}
        >
          <Text style={styles.cancelBtnText}>Bekor qilish</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={onSubmit}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <>
              <Ionicons name="send" size={16} color={C.white} />
              <Text style={styles.submitBtnText}>Yuborish</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footerHint}>
        <Ionicons name="flash-outline" size={12} color={C.muted} />
        <Text style={styles.footerHintText}>
          So'rov omborchiga Telegram orqali yuboriladi
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 10,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.label,
  },
  submitBtn: {
    flex: 1.5,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },
  footerHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  footerHintText: {
    fontSize: 11,
    color: C.muted,
  },
});
