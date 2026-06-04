import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../api/reports.api';
import ErrorView from '@/components/common/ErrorView';
import {
  ProductRowItem,
  HorizontalBarChart,
  fmtShort,
  fmtInt,
  PERIODS,
  getPeriodDates,
  type PeriodKey,
} from './TopProductsComponents';
import { C, styles } from './TopProductsScreen.styles';

// ─── TopProductsScreen ─────────────────────────────────
type ViewMode = 'list' | 'chart';

interface Props {
  onClose?: () => void;
}

export default function TopProductsScreen({ onClose }: Props) {
  const navigation = useNavigation();
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const days = PERIODS.find((p) => p.key === period)!.days;
  const { from, to } = useMemo(() => getPeriodDates(days), [days]);

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['top-products', from, to],
    queryFn: () => reportsApi.getTopProducts(from, to, 10),
    staleTime: 5 * 60_000,
  });

  const totalRevenue = useMemo(
    () => products.reduce((s, p) => s + Number(p.totalRevenue), 0),
    [products],
  );
  const totalQty = useMemo(
    () => products.reduce((s, p) => s + Number(p.totalQty), 0),
    [products],
  );

  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => (onClose ? onClose() : navigation.goBack())}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top mahsulotlar</Text>
        <View style={styles.spacer} />
      </View>

      {/* Controls: period + view toggle */}
      <View style={styles.controlsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
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

        {/* View toggle */}
        <View style={styles.toggleWrap}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.75}
          >
            <Ionicons
              name="list-outline"
              size={18}
              color={viewMode === 'list' ? C.white : C.muted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'chart' && styles.toggleBtnActive]}
            onPress={() => setViewMode('chart')}
            activeOpacity={0.75}
          >
            <Ionicons
              name="bar-chart-outline"
              size={18}
              color={viewMode === 'chart' ? C.white : C.muted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <>
          {/* Summary strip */}
          {products.length > 0 && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Jami tushum</Text>
                <Text style={styles.summaryValue}>{fmtShort(totalRevenue)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Jami sotildi</Text>
                <Text style={styles.summaryValue}>{fmtInt(totalQty)} dona</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Mahsulotlar</Text>
                <Text style={styles.summaryValue}>{products.length} ta</Text>
              </View>
            </View>
          )}

          {products.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="trending-up-outline" size={44} color={C.muted} />
              <Text style={styles.emptyText}>Bu davr uchun ma'lumot yo'q</Text>
            </View>
          ) : viewMode === 'list' ? (
            <FlatList
              data={products}
              keyExtractor={(p) => p.productId}
              renderItem={({ item, index }) => (
                <ProductRowItem
                  rank={index + 1}
                  productName={item.productName}
                  totalQty={item.totalQty}
                  totalRevenue={item.totalRevenue}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.chartContent}
            >
              <Text style={styles.sectionLabel}>TOP 10 MAHSULOT (TUSHUM BO'YICHA)</Text>
              <View style={styles.chartCard}>
                <HorizontalBarChart data={products} />
              </View>

              {/* Legend: qty ranking */}
              <Text style={styles.sectionLabel}>SOTISH SONI BO'YICHA</Text>
              <View style={styles.chartCard}>
                {[...products]
                  .sort((a, b) => b.totalQty - a.totalQty)
                  .slice(0, 5)
                  .map((item, i) => (
                    <View key={item.productId}>
                      {i > 0 && <View style={styles.rowDivider} />}
                      <View style={styles.qtyRow}>
                        <Text style={styles.qtyRank}>{i + 1}</Text>
                        <Text style={styles.qtyName} numberOfLines={1}>{item.productName}</Text>
                        <Text style={styles.qtyVal}>{fmtInt(item.totalQty)} dona</Text>
                      </View>
                    </View>
                  ))}
              </View>
            </ScrollView>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
