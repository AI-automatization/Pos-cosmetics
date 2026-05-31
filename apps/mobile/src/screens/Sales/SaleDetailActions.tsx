import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './SaleDetailModal.styles';

interface SaleDetailActionsProps {
  readonly isCompleted: boolean;
  readonly onClose: () => void;
}

export default function SaleDetailActions({ isCompleted, onClose }: SaleDetailActionsProps) {
  if (!isCompleted) {
    return (
      <TouchableOpacity
        style={styles.btnClose}
        onPress={onClose}
        activeOpacity={0.8}
      >
        <Text style={styles.btnCloseText}>Yopish</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.btnReturn}
        activeOpacity={0.8}
        onPress={onClose}
      >
        <Ionicons name="return-up-back-outline" size={18} color="#DC2626" />
        <Text style={styles.btnReturnText}>Qaytarish</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btnPrint}
        activeOpacity={0.8}
        onPress={onClose}
      >
        <Ionicons name="print-outline" size={18} color="#FFFFFF" />
        <Text style={styles.btnPrintText}>Chek chop etish</Text>
      </TouchableOpacity>
    </View>
  );
}
