import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  message: string;
}

export default function EmptyState({ icon = '📭', message }: EmptyStateProps) {
  return (
    <View style={styles.center}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
