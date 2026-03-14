import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonCard from './SkeletonCard';

interface SkeletonListProps {
  count?: number;
  itemHeight?: number;
}

export default function SkeletonList({ count = 4, itemHeight = 80 }: SkeletonListProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={itemHeight} style={styles.item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  item: {
    width: '100%',
  },
});
