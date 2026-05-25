import React from 'react';
import { ScrollView, TouchableOpacity, Text, View, RefreshControl, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAnalytics } from '../../hooks/useAnalytics';
import ScreenLayout from '../../components/layout/ScreenLayout';
import SkeletonList from '../../components/common/SkeletonList';
import ErrorView from '../../components/common/ErrorView';
import RevenueByBranchChart from './RevenueByBranchChart';
import OrdersByBranchChart from './OrdersByBranchChart';
import StockValueByBranch from './StockValueByBranch';
import { Period } from '../../hooks/usePeriodFilter';
import { Colors } from '../../config/theme';
import { AnalyticsStackParamList } from '../../navigation/types';
import { styles } from './AnalyticsScreen.styles';

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

  const isInitialLoading =
    revenueByBranch.isLoading || stockValue.isLoading;

  const allFailed =
    revenueByBranch.isError && branchComparison.isError && stockValue.isError;

  const handleRetryAll = () => {
    void handleRefresh();
  };

  // Period tabs are always visible
  const periodRow = (
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
  );

  // Initial loading skeleton
  if (isInitialLoading) {
    return (
      <ScreenLayout title={t('analytics.title')}>
        {periodRow}
        <SkeletonList count={3} itemHeight={120} />
      </ScreenLayout>
    );
  }

  // All queries failed — show error with retry
  if (allFailed) {
    return (
      <ScreenLayout title={t('analytics.title')}>
        {periodRow}
        <ErrorView
          error={revenueByBranch.error ?? stockValue.error ?? branchComparison.error}
          onRetry={handleRetryAll}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={t('analytics.title')}>
      {periodRow}

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={revenueByBranch.isFetching || stockValue.isFetching}
            onRefresh={() => { void handleRefresh(); }}
          />
        }
        contentContainerStyle={styles.content}
      >
        {revenueByBranch.data === undefined && !revenueByBranch.isError ? (
          <ChartLoadingHint />
        ) : (
          <RevenueByBranchChart data={revenueByBranch.data} />
        )}

        {revenueByBranch.data === undefined && !revenueByBranch.isError ? (
          <ChartLoadingHint />
        ) : (
          <OrdersByBranchChart data={revenueByBranch.data} />
        )}

        {stockValue.data === undefined && !stockValue.isError ? (
          <ChartLoadingHint />
        ) : (
          <StockValueByBranch data={stockValue.data} />
        )}

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

function ChartLoadingHint() {
  return (
    <View style={styles.chartLoadingContainer}>
      <ActivityIndicator size="small" color={Colors.primary} />
      <Text style={styles.chartLoadingText}>Ma'lumot yuklanmoqda...</Text>
    </View>
  );
}

