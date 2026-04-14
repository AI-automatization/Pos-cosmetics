import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TextInput,
  StyleSheet, TouchableWithoutFeedback, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './SmenaComponents';

interface Props {
  readonly visible: boolean;
  readonly loading: boolean;
  readonly onClose: () => void;
  readonly onConfirm: (openingCash: number) => void;
}

export default function SmenaOpenSheet({ visible, loading, onClose, onConfirm }: Props) {
  const [cash, setCash] = useState('0');

  useEffect(() => {
    if (visible) setCash('0');
  }, [visible]);

  const cashNum = parseFloat(cash.replace(/\s/g, '')) || 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrapper}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="play-circle-outline" size={24} color={C.green} />
            </View>
            <View>
              <Text style={styles.title}>Smena ochish</Text>
              <Text style={styles.subtitle}>Kassadagi boshlang'ich naqd miqdorini kiriting</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>BOSHLANG'ICH NAQD (UZS)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="cash-outline" size={20} color={C.muted} />
            <TextInput
              style={styles.input}
              value={cash}
              onChangeText={setCash}
              keyboardType="numeric"
              textAlign="right"
              selectTextOnFocus
            />
            <Text style={styles.inputSuffix}>UZS</Text>
          </View>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => onConfirm(cashNum)}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.confirmText}>Smena boshlash</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  wrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center', marginBottom: 20,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24,
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#F0FDF4',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 13, color: C.muted, marginTop: 2 },
  inputLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16, height: 56,
    gap: 10, marginBottom: 20,
  },
  input: {
    flex: 1, fontSize: 22, fontWeight: '700', color: C.text,
  },
  inputSuffix: { fontSize: 14, fontWeight: '600', color: C.muted },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: C.green,
    borderRadius: 14, height: 54,
    shadowColor: C.green, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  confirmText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
