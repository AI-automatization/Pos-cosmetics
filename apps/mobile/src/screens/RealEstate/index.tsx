import React from 'react';
import { FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RealEstateStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import ErrorView from '@/components/common/ErrorView';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonCard, SkeletonList } from '@/components/common/SkeletonLoader';
import { realEstateApi } from '@/api';
import { safeQueryFn } from '@/utils/error';
import { formatCurrency } from '@/utils/format';
import { QUERY_STALE_TIMES } from '@/config/constants';
import type { Property, PropertyStatus, RealEstateStats } from '@/api/realestate.api';

type Props = {
  navigation: NativeStackNavigationProp<RealEstateStackParamList, 'Properties'>;
};

const STATUS_VARIANT: Record<PropertyStatus, 'success' | 'warning' | 'error'> = {
  RENTED: 'success',
  VACANT: 'warning',
  MAINTENANCE: 'error',
};

function PropertyCard({
  item,
  onPress,
}: {
  item: Property;
  onPress: () => void;
}): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button">
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.propertyName}>{item.name}</Text>
            <Text style={styles.propertyAddress} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
          <Badge
            label={t(`realestate.status${item.status}`)}
            variant={STATUS_VARIANT[item.status]}
          />
        </View>
        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(item.rentAmount, item.currency)}
            </Text>
            <Text style={styles.statLabel}>{t('realestate.monthlyRent')}</Text>
          </View>
          {item.roi !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.roi.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>{t('realestate.roi')}</Text>
            </View>
          )}
          {item.area !== undefined && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.area} m²</Text>
              <Text style={styles.statLabel}>{t('realestate.area')}</Text>
            </View>
          )}
        </View>
        {item.tenantName ? (
          <Text style={styles.tenantName}>👤 {item.tenantName}</Text>
        ) : null}
      </Card>
    </TouchableOpacity>
  );
}

function StatsCard({ t }: { t: (key: string) => string }): React.JSX.Element {
  const EMPTY_STATS: RealEstateStats = { totalProperties: 0, rented: 0, vacant: 0, maintenance: 0, totalMonthlyRent: 0, currency: 'UZS', overduePayments: 0, averageRoi: 0 };
  const { data, isLoading } = useQuery({
    queryKey: ['realestate', 'stats'],
    queryFn: safeQueryFn<RealEstateStats>(() => realEstateApi.getStats(), EMPTY_STATS),
    staleTime: QUERY_STALE_TIMES.REALESTATE,
  });

  if (isLoading) return <SkeletonCard />;
  if (!data) return <View />;

  return (
    <Card>
      <Text style={styles.sectionTitle}>{t('realestate.overview')}</Text>
      <View style={styles.statsRow}>
        <View style={styles.overviewStat}>
          <Text style={styles.overviewValue}>{data.rented}</Text>
          <Text style={styles.overviewLabel}>{t('realestate.rented')}</Text>
        </View>
        <View style={styles.overviewStat}>
          <Text style={[styles.overviewValue, data.vacant > 0 && styles.warningText]}>
            {data.vacant}
          </Text>
          <Text style={styles.overviewLabel}>{t('realestate.vacant')}</Text>
        </View>
        <View style={styles.overviewStat}>
          <Text
            style={[styles.overviewValue, data.overduePayments > 0 && styles.errorText]}
          >
            {data.overduePayments}
          </Text>
          <Text style={styles.overviewLabel}>{t('realestate.overdue')}</Text>
        </View>
        <View style={styles.overviewStat}>
          <Text style={styles.overviewValue}>
            {formatCurrency(data.totalMonthlyRent, data.currency)}
          </Text>
          <Text style={styles.overviewLabel}>{t('realestate.totalRent')}</Text>
        </View>
      </View>
    </Card>
  );
}

export default function PropertiesScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['realestate', 'properties'],
    queryFn: safeQueryFn<Property[]>(() => realEstateApi.getProperties(), []),
    staleTime: QUERY_STALE_TIMES.REALESTATE,
  });

  if (isLoading) {
    return (
      <ScreenLayout title={t('realestate.title')}>
        <SkeletonCard />
        <SkeletonList count={3} />
      </ScreenLayout>
    );
  }

  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <ScreenLayout
      title={t('realestate.title')}
      onRefresh={() => void refetch()}
      isRefreshing={isFetching}
      scrollable={false}
    >
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<StatsCard t={t} />}
        renderItem={({ item }) => (
          <PropertyCard
            item={item}
            onPress={() =>
              navigation.navigate('PropertyDetail', {
                propertyId: item.id,
                propertyName: item.name,
              })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState message={t('realestate.noProperties')} icon="🏢" />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    flexGrow: 1,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  overviewLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  warningText: { color: '#d97706' },
  errorText: { color: '#dc2626' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  propertyAddress: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a56db',
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  tenantName: {
    fontSize: 13,
    color: '#374151',
    marginTop: 4,
  },
  separator: {
    height: 8,
  },
});
