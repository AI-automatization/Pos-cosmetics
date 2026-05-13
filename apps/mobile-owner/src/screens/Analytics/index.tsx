import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, StyleSheet, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAnalytics } from '../../hooks/useAnalytics';
import ScreenLayout from '../../components/layout/ScreenLayout';
import RevenueByBranchChart from './RevenueByBranchChart';
import OrdersByBranchChart from './OrdersByBranchChart';
import StockValueByBranch from './StockValueByBranch';
import { Period } from '../../hooks/usePeriodFilter';
import { Colors, Radii, Shadows } from '../../config/theme';
import { AnalyticsStackParamList } from '../../navigation/types';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const PERIODS: Period[] = ['today', 'week', 'month', 'year'];

const TOOL_CARDS: {
  key: keyof AnalyticsStackParamList;
  icon: IoniconsName;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
}[] = [
  {
    key: 'AbcAnalysis',
    icon: 'pie-chart-outline',
    title: 'ABC Tahlil',
    subtitle: 'Mahsulotlarni daromad bo\'yicha A/B/C guruhlarga ajratish',
    color: Colors.success,
    bg: Colors.successLight,
  },
  {
    key: 'DeadStock',
    icon: 'alert-circle-outline',
    title: 'Harakatsiz Tovarlar',
    subtitle: 'Uzoq vaqt sotilmagan mahsulotlarni aniqlash',
    color: Colors.warning,
    bg: Colors.warningLight,
  },
];

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AnalyticsStackParamList>>();
  const { period, setPeriod, revenueByBranch, branchComparison, stockValue } = useAnalytics();

  const handleRefresh = async () => {
    await Promise.all([revenueByBranch.refetch(), branchComparison.refetch(), stockValue.refetch()]);
  };

  return (
    <ScreenLayout title={t('analytics.title')}>
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodTab, period === p && styles.periodTabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {t(`common.${p}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={revenueByBranch.isFetching}
            onRefresh={() => { void handleRefresh(); }}
          />
        }
        contentContainerStyle={styles.content}
      >
        <RevenueByBranchChart data={revenueByBranch.data} />
        <OrdersByBranchChart data={revenueByBranch.data} />
        <StockValueByBranch data={stockValue.data} />

        {/* Analytics Tools */}
        <View style={styles.toolsSection}>
          <Text style={styles.toolsSectionTitle}>Tahlil vositalari</Text>
          {TOOL_CARDS.map((card) => (
            <TouchableOpacity
              key={card.key}
              style={styles.toolCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(card.key)}
            >
              <View style={[styles.toolIconBox, { backgroundColor: card.bg }]}>
                <Ionicons name={card.icon} size={22} color={card.color} />
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>{card.title}</Text>
                <Text style={styles.toolSubtitle} numberOfLines={2}>
                  {card.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  periodTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.sm,
    backgroundColor: Colors.bgSubtle,
  },
  periodTabActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  periodTextActive: {
    color: Colors.textWhite,
  },
  content: { paddingBottom: 32 },

  // Tools section
  toolsSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 10,
  },
  toolsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
    ...Shadows.card,
  },
  toolIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  toolSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
