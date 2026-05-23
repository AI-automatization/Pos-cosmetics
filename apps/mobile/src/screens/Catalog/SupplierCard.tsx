import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Supplier } from '../../api/catalog.api';
import { C, styles } from './SuppliersScreen.styles';

interface SupplierCardProps {
  readonly supplier: Supplier;
  readonly onEdit: (s: Supplier) => void;
  readonly onDelete: (s: Supplier) => void;
}

export default function SupplierCard({ supplier, onEdit, onDelete }: SupplierCardProps) {
  const handleMenu = () => {
    Alert.alert(supplier.name, undefined, [
      { text: 'Tahrirlash', onPress: () => onEdit(supplier) },
      {
        text: "O'chirish",
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            "O'chirishni tasdiqlang",
            `"${supplier.name}" o'chirilsinmi?`,
            [
              { text: 'Bekor', style: 'cancel' },
              { text: "O'chirish", style: 'destructive', onPress: () => onDelete(supplier) },
            ],
          ),
      },
      { text: 'Bekor qilish', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="business" size={22} color={C.primary} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.supplierName}>{supplier.name}</Text>
        {supplier.company ? (
          <Text style={styles.supplierCompany}>{supplier.company}</Text>
        ) : null}
        {supplier.phone ? (
          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={13} color={C.muted} />
            <Text style={styles.metaText}>{supplier.phone}</Text>
          </View>
        ) : null}
        {supplier.address ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={C.muted} />
            <Text style={styles.metaText} numberOfLines={1}>{supplier.address}</Text>
          </View>
        ) : null}
      </View>
      <TouchableOpacity style={styles.menuBtn} onPress={handleMenu} activeOpacity={0.7}>
        <Ionicons name="ellipsis-vertical" size={18} color={C.muted} />
      </TouchableOpacity>
    </View>
  );
}
