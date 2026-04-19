import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RealEstateStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import ErrorView from '@/components/common/ErrorView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { SkeletonCard } from '@/components/common/SkeletonLoader';
import { realEstateApi } from '@/api';
import { formatDateTime } from '@/utils/format';
import { QUERY_STALE_TIMES } from '@/config/constants';
import type { RentalPayment } from '@/api/realestate.api';
import PropertyHero from './PropertyHero';
import { MonthlyChart, PaymentHistoryRow } from './MonthlyChart';

type Props = {
  navigation: NativeStackNavigationProp<RealEstateStackParamList, 'PropertyDetail'>;
  route: RouteProp<RealEstateStackParamList, 'PropertyDetail'>;
};

export default function PropertyDetailScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { propertyId } = route.params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['realestate', 'property', propertyId],
    queryFn: () => realEstateApi.getProperty(propertyId),
    staleTime: QUERY_STALE_TIMES.REALESTATE,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['realestate', 'payments', propertyId],
    queryFn: () => realEstateApi.getRentalPayments(propertyId),
    staleTime: QUERY_STALE_TIMES.REALESTATE,
  });

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;
  if (!data) return <View />;

  const visiblePayments: RentalPayment[] = (payments ?? []).slice(0, 10);
  const hasMore = (payments?.length ?? 0) > 10;

  return (
    <ScreenLayout title={data.name} onRefresh={() => void refetch()}>
      <PropertyHero property={data} />

      {data.tenantName ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('realestate.tenant')}</Text>
          <View style={styles.tenantCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('realestate.tenantName')}</Text>
              <Text style={styles.infoValue}>{data.tenantName}</Text>
            </View>
            {data.tenantPhone ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('realestate.tenantPhone')}</Text>
                <Text style={styles.infoValue}>{data.tenantPhone}</Text>
              </View>
            ) : null}
            {data.contractStart ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('realestate.contractStart')}</Text>
                <Text style={styles.infoValue}>{formatDateTime(data.contractStart)}</Text>
              </View>
            ) : null}
            {data.contractEnd ? (
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>{t('realestate.contractEnd')}</Text>
                <Text style={styles.infoValue}>{formatDateTime(data.contractEnd)}</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        {paymentsLoading ? (
          <SkeletonCard />
        ) : (
          <MonthlyChart payments={payments ?? []} />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('realestate.paymentHistory')}</Text>
        {visiblePayments.map((item) => (
          <View key={item.id} style={styles.rowSpacing}>
            <PaymentHistoryRow item={item} />
          </View>
        ))}
      </View>

      {hasMore ? (
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() =>
            navigation.navigate('RentalPayments', {
              propertyId: data.id,
              propertyName: data.name,
            })
          }
          accessibilityRole="button"
        >
          <Text style={styles.viewAllText}>
            {t('realestate.viewAllPayments', { count: payments?.length })}
          </Text>
        </TouchableOpacity>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  tenantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  rowSpacing: {
    marginBottom: 8,
  },
  viewAllBtn: {
    margin: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
});
