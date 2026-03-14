import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  message: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

export default function EmptyState({ message, icon = 'folder-open-outline' }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color="#9CA3AF" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  message: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
