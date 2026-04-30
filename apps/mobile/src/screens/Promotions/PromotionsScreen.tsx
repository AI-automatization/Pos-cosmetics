import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { promotionsApi } from '@/api';
import type { Promotion, PromotionType } from '@/api';
import ErrorView from '@/components/common/ErrorView';
import EmptyState from '@/components/common/EmptyState';

const C = {
  bg: '#F9FAFB',
  white: '#FFFFFF',
  text: '#111827',
  muted: '#9CA3AF',
  border: '#E5E7EB',
  primary: '#2563EB',
  green: '#16A34A',
  orange: '#D97706',
  purple: '#7C3AED',
};

type FilterKey = 'ALL' | 'ACTIVE' | 'ENDED';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'Barchasi' },
  { key: 'ACTIVE', label: 'Faol' },
  { key: 'ENDED', label: 'Tugatilgan' },
];

const TYPE_COLORS: Record<PromotionType, string> = {
  PERCENT: '#2563EB',
  FIXED: '#16A34A',
  BUY_X_GET_Y: '#D97706',
  BUNDLE: '#7C3AED',
};

function getTypeLabel(type: PromotionType): string {
  switch (type) {
    case 'PERCENT': return 'Foiz chegirma';
    case 'FIXED': return 'Miqdor chegirma';
    case 'BUY_X_GET_Y': return 'X olsang Y bepul';
    case 'BUNDLE': return "To'plam";
  }
}

function getTypeIcon(type: PromotionType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'PERCENT': return 'percent-outline';
    case 'FIXED': return 'cash-outline';
    case 'BUY_X_GET_Y': return 'gift-outline';
    case 'BUNDLE': return 'layers-outline';
  }
}

function getRuleDescription(type: PromotionType, rules: Record<string, unknown>): string {
  switch (type) {
    case 'PERCENT':
      return `${rules['percent'] as number}% chegirma`;
    case 'FIXED':
      return `${(rules['amount'] as number).toLocaleString('ru-RU')} UZS chegirma`;
    case 'BUY_X_GET_Y':
      return `${rules['buyQty'] as number} ta olsang ${rules['getQty'] as number} ta bepul`;
    case 'BUNDLE':
      return `To'plam: ${rules['discount'] as number}% chegirma`;
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

// ─── PromotionCard ────────────────────────────────────────────────────────────

const PromotionCard = React.memo(function PromotionCard({ item }: { item: Promotion }) {
  const color = TYPE_COLORS[item.type];
  const icon = getTypeIcon(item.type);
  const ruleDesc = getRuleDescription(item.type, item.rules);
  const typeLabel = getTypeLabel(item.type);
  const dateRange = `${formatDate(item.validFrom)} → ${item.validTo ? formatDate(item.validTo) : 'Muddatsiz'}`;

  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: color + '1A' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusEnded]}>
            <Text style={[styles.statusText, item.isActive ? styles.statusActiveText : styles.statusEndedText]}>
              {item.isActive ? 'Faol' : 'Tugatilgan'}
            </Text>
          </View>
        </View>

        <Text style={styles.ruleText}>{ruleDesc}</Text>

        <View style={styles.cardBottom}>
          <View style={[styles.typeBadge, { backgroundColor: color + '1A' }]}>
            <Text style={[styles.typeText, { color }]}>{typeLabel}</Text>
          </View>
          <Text style={styles.dateText}>{dateRange}</Text>
        </View>
      </View>
    </View>
  );
});

// ─── PromotionsScreen ─────────────────────────────────────────────────────────

export default function PromotionsScreen() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => promotionsApi.getAll(),
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    if (filter === 'ACTIVE') return data.filter((p) => p.isActive);
    if (filter === 'ENDED') return data.filter((p) => !p.isActive);
    return data;
  }, [data, filter]);

  const keyExtractor = useCallback((item: Promotion) => item.id, []);
  const renderItem = useCallback(
    ({ item }: { item: Promotion }) => <PromotionCard item={item} />,
    [],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Aksiyalar</Text>
          <View style={styles.headerSpacer} />
        </View>
        <ActivityIndicator style={styles.loader} size="large" color={C.primary} />
      </SafeAreaView>
    );
  }

  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aksiyalar</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const count = f.key === 'ALL' ? data.length
            : f.key === 'ACTIVE' ? data.filter((p) => p.isActive).length
            : data.filter((p) => !p.isActive).length;
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{f.label}</Text>
              <Text style={[styles.filterCount, active && styles.filterCountActive]}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState title="Aksiya topilmadi" />
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  loader: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginLeft: -8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: C.text, textAlign: 'center' },
  headerSpacer: { width: 40 },

  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  filterChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 7, borderRadius: 10,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
  },
  filterChipActive: { backgroundColor: '#EFF6FF', borderColor: C.primary },
  filterLabel: { fontSize: 12, fontWeight: '600', color: C.muted },
  filterLabelActive: { color: C.primary },
  filterCount: { fontSize: 13, fontWeight: '800', color: C.text },
  filterCountActive: { color: C.primary },

  listContent: { padding: 16, paddingBottom: 32 },
  separator: { height: 10 },

  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardName: { flex: 1, fontSize: 15, fontWeight: '700', color: C.text },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  statusActive: { backgroundColor: '#D1FAE5' },
  statusEnded: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusActiveText: { color: '#16A34A' },
  statusEndedText: { color: C.muted },

  ruleText: { fontSize: 13, color: C.text, fontWeight: '500' },

  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  typeText: { fontSize: 11, fontWeight: '600' },
  dateText: { fontSize: 12, color: C.muted },
});
