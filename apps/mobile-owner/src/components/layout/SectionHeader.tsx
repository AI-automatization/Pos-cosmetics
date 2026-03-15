import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SectionHeaderProps {
  title: string;
  rightText?: string;
  onRightPress?: () => void;
}

export default function SectionHeader({ title, rightText, onRightPress }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {rightText && (
        <TouchableOpacity onPress={onRightPress}>
          <Text style={styles.rightText}>{rightText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  rightText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
});
