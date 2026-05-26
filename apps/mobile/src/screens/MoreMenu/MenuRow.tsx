import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MenuItem } from './menuGroups';
import { styles } from './styles';

// ─── MenuRow component ────────────────────────────────────

interface MenuRowProps {
  readonly item: MenuItem;
  readonly isLast: boolean;
  readonly onPress: () => void;
}

export function MenuRow({ item, isLast, onPress }: MenuRowProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.menuRow, !isLast && styles.menuRowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconWrap}>
        <Ionicons name={item.icon as React.ComponentProps<typeof Ionicons>['name']} size={18} color="#374151" />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      {item.badge != null ? (
        <View style={styles.soonBadge}>
          <Text style={styles.soonBadgeText}>{item.badge}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );
}
