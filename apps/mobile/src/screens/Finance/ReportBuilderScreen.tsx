import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { reportsApi } from '../../api/reports.api';
import type { EmployeeActivity } from '../../api/reports.api';
import type { FinanceStackParamList } from '../../navigation/types';
import { todayISO, daysAgoISO } from '../../utils/date';
import { TableHeader, TableFooter } from './ReportTable';
import { styles, C } from './ReportBuilderScreen.styles';

// ─── Types ────────────────────────────────────────────────
type Nav = NativeStackNavigationProp<FinanceStackParamList, 'ReportBuilder'>;
type Dimension = 'product' | 'date' | 'cashier';
type Period = '7d' | '30d' | '90d';

// ─── Constants ────────────────────────────────────────────
const PERIOD_DAYS: Record<Period, number> = {
  '7d': 6,
  '30d': 29,
  '90d': 89,
};

const DIMENSIONS: { key: Dimension; label: string }[] = [
  { key: 'product', label: 'Mahsulot' },
  { key: 'date',    label: 'Sana'     },
  { key: 'cashier', label: 'Kassir'   },
];

const PERIODS: { key: Period; label: string }[] = [
  { key: '7d',  label: '7 kun'  },
  { key: '30d', label: '30 kun' },
  { key: '90d', label: '90 kun' },
];

const STALE_TIME = 5 * 60_000;

// ─── Helpers ──────────────────────────────────────────────
const fmtNum = (n: number): string => {
  const abs = Math.abs(Number(n));
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (Number(n) < 0 ? '-' : '') + formatted;
};

function fmtDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

// ─── ReportBuilderScreen ──────────────────────────────────
export default function ReportBuilderScreen() {
  const navigation = useNavigation<Nav>();

  const [dimension, setDimension] = useState<Dimension>('product');
  const [period, setPeriod] = useState<Period>('30d');
  const [executed, setExecuted] = useState(false);

  const { from, to } = useMemo(() => ({
    from: daysAgoISO(PERIOD_DAYS[period]),
    to:   todayISO(),
  }), [period]);

  const productQuery = useQuery({
    queryKey: ['report-builder', 'product', from, to],
    queryFn:  () => reportsApi.getTopProducts(from, to, 20),
    enabled:  executed && dimension === 'product',
    staleTime: STALE_TIME,
  });

  const dateQuery = useQuery({
    queryKey: ['report-builder', 'date', from, to],
    queryFn:  () => reportsApi.getDailyRevenue(from, to),
    enabled:  executed && dimension === 'date',
    staleTime: STALE_TIME,
  });

  const cashierQuery = useQuery({
    queryKey: ['report-builder', 'cashier', from, to],
    queryFn:  () => reportsApi.getEmployeeActivity(from, to),
    enabled:  executed && dimension === 'cashier',
    staleTime: STALE_TIME,
  });

  function handleRun() {
    setExecuted(true);
  }

  function handleClear() {
    setExecuted(false);
  }

  const activeQuery =
    dimension === 'product' ? productQuery :
    dimension === 'date'    ? dateQuery    :
                              cashierQuery;

  const isLoading = executed && activeQuery.isLoading;
  const hasError  = executed && activeQuery.isError;

  // ─── Result tables ──────────────────────────────────────
  function renderResults() {
    if (!executed) return null;
    if (isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color={C.primary}
          style={styles.loader}
        />
      );
    }
    if (hasError) {
      return <Text style={styles.errorText}>Ma'lumot yuklanmadi</Text>;
    }

    if (dimension === 'product') {
      const rows = productQuery.data ?? [];
      if (rows.length === 0) {
        return <Text style={styles.emptyText}>Natija topilmadi</Text>;
      }
      const totalRevenue = rows.reduce((s, r) => s + Number(r.totalRevenue), 0);
      const totalQty     = rows.reduce((s, r) => s + Number(r.totalQty), 0);
      return (
        <View style={styles.tableCard}>
          <TableHeader cols={['Mahsulot', 'Miqdor', 'Daromad']} />
          {rows.map((row, idx) => (
            <View
              key={row.productId}
              style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
            >
              <Text style={[styles.tableCell, styles.tableCellFlex2]} numberOfLines={1}>
                {row.productName}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellRight]}>
                {fmtNum(row.totalQty)}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellRight]}>
                {fmtNum(row.totalRevenue)}
              </Text>
            </View>
          ))}
          <TableFooter cols={['Jami', fmtNum(totalQty), fmtNum(totalRevenue)]} />
        </View>
      );
    }

    if (dimension === 'date') {
      const rows = dateQuery.data ?? [];
      if (rows.length === 0) {
        return <Text style={styles.emptyText}>Natija topilmadi</Text>;
      }
      const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
      const totalOrders  = rows.reduce((s, r) => s + r.orderCount, 0);
      return (
        <View style={styles.tableCard}>
          <TableHeader cols={['Sana', 'Buyurtmalar', 'Daromad']} />
          {rows.map((row, idx) => (
            <View
              key={row.date}
              style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
            >
              <Text style={[styles.tableCell, styles.tableCellFlex2]}>
                {fmtDateShort(row.date)}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellRight]}>
                {fmtNum(row.orderCount)}
              </Text>
              <Text style={[styles.tableCell, styles.tableCellRight]}>
                {fmtNum(row.revenue)}
              </Text>
            </View>
          ))}
          <TableFooter cols={['Jami', fmtNum(totalOrders), fmtNum(totalRevenue)]} />
        </View>
      );
    }

    // cashier
    const rows = cashierQuery.data ?? [];
    if (rows.length === 0) {
      return <Text style={styles.emptyText}>Natija topilmadi</Text>;
    }
    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    const totalOrders  = rows.reduce((s, r) => s + r.ordersCount, 0);
    return (
      <View style={styles.tableCard}>
        <TableHeader cols={['Kassir', 'Buyurtmalar', 'Daromad']} />
        {rows.map((row: EmployeeActivity, idx: number) => (
          <View
            key={row.employeeId}
            style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
          >
            <Text style={[styles.tableCell, styles.tableCellFlex2]} numberOfLines={1}>
              {row.employeeName}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellRight]}>
              {fmtNum(row.ordersCount)}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellRight]}>
              {fmtNum(row.revenue)}
            </Text>
          </View>
        ))}
        <TableFooter cols={['Jami', fmtNum(totalOrders), fmtNum(totalRevenue)]} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hisobot yaratish</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Dimension selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>O'lchov:</Text>
          <View style={styles.optionsRow}>
            {DIMENSIONS.map((d) => {
              const active = d.key === dimension;
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.optionBtn, active && styles.optionBtnActive]}
                  onPress={() => { setDimension(d.key); setExecuted(false); }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Period selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Davr:</Text>
          <View style={styles.optionsRow}>
            {PERIODS.map((p) => {
              const active = p.key === period;
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.optionBtn, active && styles.optionBtnActive]}
                  onPress={() => { setPeriod(p.key); setExecuted(false); }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.runBtn}
            onPress={handleRun}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle-outline" size={18} color={C.white} />
            <Text style={styles.runBtnText}>Ishga tushirish</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClear}
            activeOpacity={0.8}
          >
            <Text style={styles.clearBtnText}>Tozalash</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        {executed && <View style={styles.divider} />}

        {/* Results */}
        {renderResults()}
      </ScrollView>
    </SafeAreaView>
  );
}
