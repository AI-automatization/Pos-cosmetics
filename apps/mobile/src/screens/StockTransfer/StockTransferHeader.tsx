// StockTransferHeader.tsx — ekran sarlavhasi komponenti

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './StockTransferColors';

interface StockTransferHeaderProps {
  readonly onBack: () => void;
  readonly onAdd:  () => void;
  readonly onListPress?: () => void;
}

export const StockTransferHeader = React.memo(function StockTransferHeader({
  onBack,
  onAdd,
  onListPress,
}: StockTransferHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="chevron-back" size={22} color={C.text} />
      </TouchableOpacity>

      <Text style={styles.title}>O'tkazma</Text>

      <View style={styles.headerActions}>
        {onListPress != null && (
          <TouchableOpacity
            style={styles.listBtn}
            onPress={onListPress}
            activeOpacity={0.7}
          >
            <Ionicons name="list-outline" size={22} color={C.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAdd}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={22} color={C.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    backgroundColor:   C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: C.bg,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     C.border,
  },
  title: {
    fontSize:   18,
    fontWeight: '800',
    color:      C.text,
  },
  headerActions: {
    flexDirection: 'row' as const,
    alignItems:    'center' as const,
    gap:           8,
  },
  listBtn: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: C.primary + '15',
    alignItems:      'center' as const,
    justifyContent:  'center' as const,
  },
  addBtn: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: C.primary + '15',
    alignItems:      'center' as const,
    justifyContent:  'center' as const,
  },
});
