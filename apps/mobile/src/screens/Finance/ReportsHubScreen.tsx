import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FinanceStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<FinanceStackParamList, 'ReportsHub'>;

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  green:   '#16A34A',
  orange:  '#D97706',
  purple:  '#7C3AED',
};

// ─── ReportCard ────────────────────────────────────────
interface ReportCardProps {
  title: string;
  description: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  onPress: () => void;
}

function ReportCard({ title, description, iconName, iconColor, iconBg, onPress }: ReportCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.cardIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={26} color={iconColor} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
      <View style={[styles.arrowBox, { backgroundColor: iconBg }]}>
        <Ionicons name="chevron-forward" size={18} color={iconColor} />
      </View>
    </TouchableOpacity>
  );
}

// ─── ReportsHubScreen ──────────────────────────────────
export default function ReportsHubScreen() {
  const navigation = useNavigation<Nav>();
  const nav = (screen: keyof FinanceStackParamList) => navigation.navigate(screen);

  const REPORTS: ReportCardProps[] = [
    {
      title:       'Kunlik savdo',
      description: "Kunlar bo'yicha tushum va buyurtmalar",
      iconName:    'bar-chart-outline',
      iconColor:   C.primary,
      iconBg:      '#EFF6FF',
      onPress:     () => nav('DailyRevenue'),
    },
    {
      title:       'Top mahsulotlar',
      description: "Eng ko'p sotilgan mahsulotlar reytingi",
      iconName:    'trending-up-outline',
      iconColor:   C.green,
      iconBg:      '#F0FDF4',
      onPress:     () => nav('TopProducts'),
    },
    {
      title:       'Smena hisobotlari',
      description: "Kassirlar va smenalar bo'yicha hisobot",
      iconName:    'time-outline',
      iconColor:   C.purple,
      iconBg:      '#F5F3FF',
      onPress:     () => nav('ShiftReports'),
    },
    {
      title:       'Nasiya qarzdorlik',
      description: "Muddati o'tgan va faol nasiyalar",
      iconName:    'alert-circle-outline',
      iconColor:   C.orange,
      iconBg:      '#FFFBEB',
      onPress:     () => nav('NasiyaAging'),
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Hisobotlar</Text>
          <Text style={styles.headerSub}>Moliyaviy tahlil va hisobotlar</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="document-text-outline" size={20} color={C.primary} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.sectionLabel}>HISOBOT TURLARI</Text>

        {REPORTS.map((r) => (
          <ReportCard key={r.title} {...r} />
        ))}

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color={C.primary} />
          <Text style={styles.infoText}>
            Hisobotlar real vaqt ma'lumotlari asosida tuziladi
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginLeft: -8 },
  headerText: { flex: 1, marginLeft: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
  },

  content: { padding: 16, paddingBottom: 40, gap: 12 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, marginBottom: 4,
  },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    padding: 16, gap: 14,
  },
  cardIcon: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  cardDesc: { fontSize: 13, color: C.muted, lineHeight: 18 },
  arrowBox: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EFF6FF', borderRadius: 12,
    borderWidth: 1, borderColor: '#BFDBFE',
    padding: 12, marginTop: 4,
  },
  infoText: { flex: 1, fontSize: 13, color: C.primary, lineHeight: 18 },
});
