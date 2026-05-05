import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ExportType } from '../../api/reports.api';

// ─── Types ─────────────────────────────────────────────────
export interface ExportItem {
  readonly type: ExportType;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ComponentProps<typeof Ionicons>['name'];
  readonly color: string;
  readonly iconBg: string;
}

interface ExportCardProps {
  readonly item: ExportItem;
  readonly isLoading: boolean;
  readonly onPress: () => void;
}

// ─── Colors (local) ────────────────────────────────────────
const C_TEXT   = '#111827';
const C_MUTED  = '#9CA3AF';
const C_WHITE  = '#FFFFFF';
const C_BORDER = '#E5E7EB';

// ─── ExportCard ────────────────────────────────────────────
const ExportCard = React.memo(function ExportCard({
  item,
  isLoading,
  onPress,
}: ExportCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.cardIcon, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={26} color={item.color} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
      </View>
      <TouchableOpacity
        style={[styles.shareBtn, { backgroundColor: item.iconBg }]}
        onPress={onPress}
        disabled={isLoading}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={item.color} />
        ) : (
          <Ionicons name="share-outline" size={20} color={item.color} />
        )}
      </TouchableOpacity>
    </View>
  );
});

export default ExportCard;

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: C_WHITE,
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     C_BORDER,
    padding:         16,
    gap:             14,
  },
  cardIcon: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody:  { flex: 1, gap: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C_TEXT },
  cardDesc:  { fontSize: 13, color: C_MUTED, lineHeight: 18 },
  shareBtn: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
});
