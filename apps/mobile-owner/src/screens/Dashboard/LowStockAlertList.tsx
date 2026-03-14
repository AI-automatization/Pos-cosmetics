import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '../../api/inventory.api';
import { Colors, Radii } from '../../config/theme';

interface LowStockAlertListProps {
  data: InventoryItem[] | undefined;
  onViewAll?: () => void;
}

export default function LowStockAlertList({ data, onViewAll }: LowStockAlertListProps) {
  const { t } = useTranslation();
  if (!data || data.length === 0) return null;

  const count = data.length;

  return (
    <TouchableOpacity style={styles.banner} onPress={onViewAll} activeOpacity={0.8}>
      <View style={styles.left}>
        <Ionicons name="warning" size={16} color={Colors.warning} />
        <Text style={styles.text}>
          {count} {t('dashboard.lowStockCount')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.warning} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.warningLight,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
});
