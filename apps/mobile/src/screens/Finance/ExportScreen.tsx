import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FinanceStackParamList } from '../../navigation/types';
import { reportsApi } from '../../api/reports.api';
import type { ExportType } from '../../api/reports.api';
import { todayISO, daysAgoISO } from '../../utils/date';
import ExportCard from './ExportCard';
import type { ExportItem } from './ExportCard';

// ─── Types ─────────────────────────────────────────────────
type Nav = NativeStackNavigationProp<FinanceStackParamList, 'Export'>;
type Period = '7d' | '30d' | '90d';

// ─── Colors ────────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
} as const;

// ─── Data ──────────────────────────────────────────────────
const EXPORTS: ExportItem[] = [
  { type: 'sales',       title: 'Sotuvlar',           description: "Barcha buyurtmalar ro'yxati", icon: 'receipt-outline',  color: '#2563EB', iconBg: '#EFF6FF' },
  { type: 'order-items', title: 'Buyurtma qatorlari', description: "Mahsulot bo'yicha batafsil", icon: 'list-outline',     color: '#7C3AED', iconBg: '#F5F3FF' },
  { type: 'products',    title: 'Mahsulotlar',         description: "Tovar katalogi to'liq",      icon: 'cube-outline',     color: '#0D9488', iconBg: '#F0FDFA' },
  { type: 'inventory',   title: 'Inventar',            description: 'Ombor qoldiqlari',           icon: 'archive-outline',  color: '#D97706', iconBg: '#FFFBEB' },
  { type: 'customers',   title: 'Xaridorlar',          description: "Mijozlar ma'lumotlari",      icon: 'people-outline',   color: '#16A34A', iconBg: '#F0FDF4' },
  { type: 'debts',       title: 'Nasiyalar',           description: 'Qarzdorlik hisoboti',        icon: 'wallet-outline',   color: '#DC2626', iconBg: '#FEF2F2' },
];

const PERIOD_LABELS: Record<Period, string> = {
  '7d':  '7 kun',
  '30d': '30 kun',
  '90d': '90 kun',
};

function periodToDates(period: Period): { from: string; to: string } {
  const to = todayISO();
  const fromMap: Record<Period, string> = {
    '7d':  daysAgoISO(6),
    '30d': daysAgoISO(29),
    '90d': daysAgoISO(89),
  };
  return { from: fromMap[period], to };
}

// ─── ExportScreen ──────────────────────────────────────────
export default function ExportScreen() {
  const navigation = useNavigation<Nav>();
  const [period, setPeriod] = useState<Period>('30d');
  const [loadingType, setLoadingType] = useState<ExportType | null>(null);

  const handleExport = async (item: ExportItem) => {
    setLoadingType(item.type);
    try {
      const { from, to } = periodToDates(period);
      const csv = await reportsApi.exportDownload(item.type, { from, to });
      await Share.share({
        message: csv,
        title:   `${item.title}-export-${todayISO()}.csv`,
      });
    } catch {
      Alert.alert('Xatolik', 'Eksport amalga oshmadi');
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Hisobot eksport</Text>
          <Text style={styles.headerSub}>CSV formatda yuklab olish</Text>
        </View>
      </View>

      {/* Period pills */}
      <View style={styles.pillRow}>
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.pill, period === p && styles.pillActive]}
            onPress={() => setPeriod(p)}
            activeOpacity={0.75}
          >
            <Text style={[styles.pillText, period === p && styles.pillTextActive]}>
              {PERIOD_LABELS[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Export list */}
      <FlatList
        data={EXPORTS}
        keyExtractor={(item) => item.type}
        renderItem={({ item }) => (
          <ExportCard
            item={item}
            isLoading={loadingType === item.type}
            onPress={() => handleExport(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={16} color={C.primary} />
            <Text style={styles.infoText}>CSV format, Share orqali yuboriladi</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   14,
    backgroundColor:   C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 48, height: 48,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: -8,
  },
  headerText:  { flex: 1, marginLeft: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerSub:   { fontSize: 12, color: C.muted, marginTop: 2 },

  pillRow: {
    flexDirection:     'row',
    gap:               8,
    paddingHorizontal: 16,
    paddingVertical:   12,
    backgroundColor:   C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical:   8,
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       C.border,
    backgroundColor:   C.bg,
  },
  pillActive:     { backgroundColor: C.primary, borderColor: C.primary },
  pillText:       { fontSize: 14, fontWeight: '600', color: C.muted },
  pillTextActive: { color: C.white },

  listContent: { padding: 16, gap: 12, paddingBottom: 40 },

  infoBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: '#EFF6FF',
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     '#BFDBFE',
    padding:         12,
    marginTop:       4,
  },
  infoText: { flex: 1, fontSize: 13, color: C.primary, lineHeight: 18 },
});
