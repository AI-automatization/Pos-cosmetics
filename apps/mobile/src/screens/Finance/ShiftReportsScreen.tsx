import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { salesApi, type ShiftDetail } from '../../api/sales.api';
import ErrorView from '@/components/common/ErrorView';
import { C, type PeriodKey, PERIODS, periodStart, fmtShort } from './shift-reports.utils';
import { styles } from './ShiftReportsScreen.styles';
import ShiftReportCard from './ShiftReportCard';

interface Props {
  onClose?: () => void;
}

export default function ShiftReportsScreen({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [period, setPeriod] = useState<PeriodKey>('30d');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['shifts-list'],
    queryFn: () => salesApi.getShifts(1, 100),
    staleTime: 3 * 60_000,
  });

  // Backend may return { items:[...] } or { data:[...] } or plain array
  const allShifts: ShiftDetail[] = (() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as ShiftDetail[];
    if (Array.isArray((data as any).items)) return (data as any).items as ShiftDetail[];
    if (Array.isArray((data as any).data))  return (data as any).data  as ShiftDetail[];
    return [];
  })();

  const filtered = useMemo(() => {
    const cutoff = periodStart(period);
    if (!cutoff) return allShifts;
    return allShifts.filter((s) => {
      const opened = typeof s.openedAt === 'string' ? new Date(s.openedAt) : s.openedAt;
      return opened >= cutoff;
    });
  }, [allShifts, period]);

  // Summary
  const totalRevenue = filtered.reduce((s, x) => s + Number(x.totalRevenue ?? 0), 0);
  const totalOrders  = filtered.reduce((s, x) => s + Number(x.totalOrders  ?? 0), 0);
  const closedCount  = filtered.filter((s) => s.status?.toUpperCase() === 'CLOSED').length;

  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  const handleBack = onClose ?? (() => navigation.goBack());

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleBack} activeOpacity={0.75}>
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smena hisobotlari</Text>
        <View style={styles.spacer} />
      </View>

      {/* Period pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsScroll}
        contentContainerStyle={styles.pillsContent}
      >
        {PERIODS.map((p) => {
          const active = p.key === period;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Summary strip */}
      {!isLoading && filtered.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Jami tushum</Text>
            <Text style={styles.summaryValue}>{fmtShort(totalRevenue)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Buyurtmalar</Text>
            <Text style={styles.summaryValue}>{totalOrders} ta</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Smenalar</Text>
            <Text style={styles.summaryValue}>{closedCount}/{filtered.length}</Text>
          </View>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <FlatList
          key={period}
          data={filtered}
          keyExtractor={(s) => s.id}
          renderItem={({ item, index }) => (
            <ShiftReportCard shift={item} index={index} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={44} color={C.muted} />
              <Text style={styles.emptyTitle}>
                {period !== 'all' ? 'Bu davrda smenalar yo\'q' : 'Smenalar yo\'q'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
