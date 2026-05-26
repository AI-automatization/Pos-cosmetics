// Ombor screen — Header component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './OmborColors';

interface Props {
  onScanPress?: () => void;
  onFilterPress?: () => void;
  onInvoicesPress?: () => void;
  onRestockRequestsPress?: () => void;
  onStockRequestPress?: () => void;
  showStockRequest?: boolean;
}

export default function OmborHeader({ onScanPress, onFilterPress, onInvoicesPress, onRestockRequestsPress, onStockRequestPress, showStockRequest }: Props) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Ombor</Text>
        <Text style={styles.headerSub}>Zaxira holati</Text>
      </View>
      <View style={styles.actions}>
        {showStockRequest && (
          <TouchableOpacity style={styles.requestBtn} onPress={onStockRequestPress} activeOpacity={0.75}>
            <Ionicons name="arrow-up-circle-outline" size={16} color={C.white} />
            <Text style={styles.requestBtnText}>So'rov</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.iconBtn} onPress={onRestockRequestsPress} activeOpacity={0.75}>
          <Ionicons name="notifications-outline" size={20} color={C.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onScanPress} activeOpacity={0.75}>
          <Ionicons name="scan-outline" size={20} color={C.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onFilterPress} activeOpacity={0.75}>
          <Ionicons name="options-outline" size={20} color={C.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onInvoicesPress} activeOpacity={0.75}>
          <Ionicons name="document-text-outline" size={20} color={C.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
  },
  headerSub: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.primary,
  },
  requestBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.white,
  },
});
