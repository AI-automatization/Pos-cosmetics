// StockMovementHeader.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { C } from './StockMovementColors';

interface Props {
  readonly onBack: () => void;
  readonly onExport?: () => void;
}

export const StockMovementHeader = React.memo(function StockMovementHeader({
  onBack,
  onExport,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.75}
      >
        <Ionicons name="chevron-back" size={22} color={C.text} />
      </TouchableOpacity>

      <View style={styles.titleRow}>
        <Ionicons name="swap-horizontal-outline" size={20} color={C.primary} />
        <Text style={styles.title}>{t('warehouse.movementsHistory')}</Text>
      </View>

      {onExport ? (
        <TouchableOpacity style={styles.backBtn} onPress={onExport} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={18} color={C.primary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backBtn} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection:       'row',
    alignItems:          'center',
    justifyContent:      'space-between',
    paddingHorizontal:   16,
    paddingVertical:     12,
    backgroundColor:     C.white,
    borderBottomWidth:   1,
    borderBottomColor:   C.border,
  },
  backBtn: {
    width:          36,
    height:         36,
    borderRadius:   18,
    backgroundColor: C.bg,
    alignItems:     'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  title: {
    fontSize:   17,
    fontWeight: '700',
    color:      C.text,
  },
});
