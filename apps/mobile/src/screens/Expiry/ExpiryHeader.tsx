// ExpiryHeader.tsx — ekran sarlavhasi komponenti

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './ExpiryColors';

interface ExpiryHeaderProps {
  readonly onBack: () => void;
}

export const ExpiryHeader = React.memo(function ExpiryHeader({
  onBack,
}: ExpiryHeaderProps) {
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

      <Text style={styles.title}>Muddati o'tganlar</Text>

      <View style={styles.iconWrapper}>
        <Ionicons name="time-outline" size={22} color={C.primary} />
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
  iconWrapper: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: C.primary + '15',
    alignItems:      'center',
    justifyContent:  'center',
  },
});
