import React, { useCallback } from 'react';
import { Alert, FlatList, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RealEstateStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ErrorView from '@/components/common/ErrorView';
import EmptyState from '@/components/common/EmptyState';
import { SkeletonCard, SkeletonList } from '@/components/common/SkeletonLoader';
import { realEstateApi } from '@/api';
import { safeQueryFn } from '@/utils/error';
import { QUERY_STALE_TIMES } from '@/config/constants';
import type { Property, RealEstateStats } from '@/api/realestate.api';
import SummaryGrid from './SummaryGrid';
import PropertyCard from './PropertyCard';

type Props = {
  navigation: NativeStackNavigationProp<RealEstateStackParamList, 'Properties'>;
};

const EMPTY_STATS: RealEstateStats = {
  totalProperties: 0,
  rented: 0,
  vacant: 0,
  maintenance: 0,
  totalMonthlyRent: 0,
  currency: 'UZS',
  overduePayments: 0,
  averageRoi: 0,
};

export default function PropertiesScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['realestate', 'stats'],
    queryFn: safeQueryFn<RealEstateStats>(() => realEstateApi.getStats(), EMPTY_STATS),
    staleTime: QUERY_STALE_TIMES.REALESTATE,
  });

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['realestate', 'properties'],
    queryFn: safeQueryFn<Property[]>(() => realEstateApi.getProperties(), []),
    staleTime: QUERY_STALE_TIMES.REALESTATE,
  });

  const handleAddProperty = useCallback((): void => {
    Alert.alert(
      'Tez orada',
      'Yangi ko\'chmas mulk qo\'shish funksiyasi backend qo\'llab-quvvatlagandan keyin faollashtiriladi.',
      [{ text: 'OK' }],
    );
  }, []);

  const listHeader = (
    <>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>{t('realestate.title')}</Text>
        <TouchableOpacity
          onPress={handleAddProperty}
          style={styles.addButton}
          accessibilityRole="button"
          accessibilityLabel={t('realestate.addProperty')}
        >
          <Ionicons name="add-circle-outline" size={26} color="#2563EB" />
        </TouchableOpacity>
      </View>
      {statsLoading ? <SkeletonCard /> : <SummaryGrid stats={statsData ?? EMPTY_STATS} />}
    </>
  );

  if (isLoading) {
    return (
      <ScreenLayout scrollable={false}>
        <SkeletonCard />
        <SkeletonList count={3} />
      </ScreenLayout>
    );
  }

  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <ScreenLayout
      onRefresh={() => void refetch()}
      isRefreshing={isFetching}
      scrollable={false}
    >
      <FlatList
        data={data}
        keyExtractor={(item: Property) => item.id}
        ListHeaderComponent={listHeader}
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
        ListEmptyComponent={<EmptyState title={t('realestate.noProperties')} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
    flexGrow: 1,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  addButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
