import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type AbcGroup } from '../../api/analytics.api';
import { Colors } from '../../config/theme';
import { s } from './AbcAnalysisScreen.styles';
import { type DayRange, RANGES, fmt, daysAgoIso, todayIso } from './abc-analysis.utils';
import AbcGroupCard from './AbcGroupCard';

// ─── Main Screen ──────────────────────────────────────────
export default function AbcAnalysisScreen() {
  const navigation = useNavigation();
  const [days, setDays] = useState<DayRange>(30);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('A');

  const from = useMemo(() => daysAgoIso(days), [days]);
  const to = useMemo(() => todayIso(), []);

  const {
    data: groups = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['analytics-abc', days],
    queryFn: () => analyticsApi.getAbcAnalysis(from, to),
    staleTime: 60_000,
  });

  const grandTotal = useMemo(
    () => groups.reduce((sum, g) => sum + g.totalRevenue, 0),
    [groups],
  );
  const totalProducts = useMemo(
    () => groups.reduce((sum, g) => sum + g.products.length, 0),
    [groups],
  );

  const toggleGroup = useCallback((g: string) => {
    setExpandedGroup((prev) => (prev === g ? null : g));
  }, []);

  const renderGroup = useCallback(
    ({ item }: { item: AbcGroup }) => (
      <AbcGroupCard
        group={item}
        expanded={expandedGroup === item.group}
        onToggle={() => toggleGroup(item.group)}
      />
    ),
    [expandedGroup, toggleGroup],
  );

  const keyExtractor = useCallback((item: AbcGroup) => item.group, []);

  const ListHeader = useMemo(
    () => (
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Jami daromad</Text>
          <Text style={s.summaryValue}>{fmt(grandTotal)}</Text>
          <Text style={s.summarySub}>UZS</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Mahsulotlar</Text>
          <Text style={s.summaryValue}>{totalProducts}</Text>
          <Text style={s.summarySub}>ta</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>Guruhlar</Text>
          <Text style={s.summaryValue}>A / B / C</Text>
          <Text style={s.summarySub}>3 ta</Text>
        </View>
      </View>
    ),
    [grandTotal, totalProducts],
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>ABC Tahlil</Text>
        <View style={s.backBtn} />
      </View>

      {/* Period selector */}
      <View style={s.periodRow}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[s.periodTab, days === r.key && s.periodTabActive]}
            onPress={() => setDays(r.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.periodText, days === r.key && s.periodTextActive]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={s.loader} size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={keyExtractor}
          renderItem={renderGroup}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => {
                void refetch();
              }}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="pie-chart-outline" size={48} color={Colors.textMuted} />
              <Text style={s.emptyText}>Ma'lumot yo'q</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
