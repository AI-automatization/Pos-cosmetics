import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './utils';

interface SavdoHeaderProps {
  readonly alertCount: number;
  readonly onBellPress: () => void;
}

export default function SavdoHeader({ alertCount, onBellPress }: SavdoHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Savdo</Text>
      <TouchableOpacity
        style={styles.headerIcon}
        activeOpacity={0.7}
        onPress={onBellPress}
      >
        <Ionicons name="notifications-outline" size={22} color={C.text} />
        {alertCount > 0 && (
          <View style={styles.bellBadge}>
            <Text style={styles.bellBadgeText}>{alertCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
  },
  headerTitle: {
    fontSize:   22,
    fontWeight: '800',
    color:      C.text,
  },
  headerIcon: {
    width:          38,
    height:         38,
    borderRadius:   19,
    backgroundColor: C.white,
    alignItems:     'center',
    justifyContent: 'center',
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 1 },
    shadowOpacity:  0.07,
    shadowRadius:   4,
    elevation:      2,
    position:       'relative',
  },
  bellBadge: {
    position:       'absolute',
    top:            -2,
    right:          -2,
    width:          16,
    height:         16,
    borderRadius:   8,
    backgroundColor: C.danger,
    alignItems:     'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    color:      '#FFFFFF',
    fontSize:   9,
    fontWeight: '700',
  },
});
