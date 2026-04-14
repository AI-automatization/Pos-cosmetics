import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RealEstateStackParamList } from '@/navigation/types';
import ScreenLayout from '@/components/layout/ScreenLayout';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import ErrorView from '@/components/common/ErrorView';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { realEstateApi } from '@/api';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { QUERY_STALE_TIMES } from '@/config/constants';
import type { PropertyStatus } from '@/api/realestate.api';

type Props = {
  navigation: NativeStackNavigationProp<RealEstateStackParamList, 'PropertyDetail'>;
  route: RouteProp<RealEstateStackParamList, 'PropertyDetail'>;
};

const STATUS_VARIANT: Record<PropertyStatus, 'success' | 'warning' | 'danger'> = {
  RENTED: 'success',
  VACANT: 'warning',
  MAINTENANCE: 'danger',
};

function InfoRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function PropertyDetailScreen({ navigation, route }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { propertyId } = route.params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['realestate', 'property', propertyId],
    queryFn: () => realEstateApi.getProperty(propertyId),
    staleTime: QUERY_STALE_TIMES.REALESTATE,
  });

  if (isLoading) return <LoadingSpinner message={t('common.loading')} />;
  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;
  if (!data) return <View />;

  return (
    <ScreenLayout title={data.name} onRefresh={() => void refetch()}>
      <Card>
        <View style={styles.statusRow}>
          <Text style={styles.propertyType}>{t(`realestate.type${data.type}`)}</Text>
          <Badge
            label={t(`realestate.status${data.status}`)}
            variant={STATUS_VARIANT[data.status]}
          />
        </View>
        <Text style={styles.address}>{data.address}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{t('realestate.financials')}</Text>
        <InfoRow
          label={t('realestate.monthlyRent')}
          value={formatCurrency(data.rentAmount, data.currency)}
        />
        {data.roi !== undefined && (
          <InfoRow label={t('realestate.roi')} value={`${data.roi.toFixed(1)}%`} />
        )}
        {data.area !== undefined && (
          <InfoRow label={t('realestate.area')} value={`${data.area} m²`} />
        )}
      </Card>

      {data.tenantName ? (
        <Card>
          <Text style={styles.sectionTitle}>{t('realestate.tenant')}</Text>
          <InfoRow label={t('realestate.tenantName')} value={data.tenantName} />
          {data.tenantPhone ? (
            <InfoRow label={t('realestate.tenantPhone')} value={data.tenantPhone} />
          ) : null}
          {data.contractStart ? (
            <InfoRow
              label={t('realestate.contractStart')}
              value={formatDateTime(data.contractStart)}
            />
          ) : null}
          {data.contractEnd ? (
            <InfoRow
              label={t('realestate.contractEnd')}
              value={formatDateTime(data.contractEnd)}
            />
          ) : null}
        </Card>
      ) : null}

      <TouchableOpacity
        style={styles.paymentsButton}
        onPress={() =>
          navigation.navigate('RentalPayments', {
            propertyId: data.id,
            propertyName: data.name,
          })
        }
        accessibilityRole="button"
      >
        <Text style={styles.paymentsButtonText}>💳 {t('realestate.viewPayments')}</Text>
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  address: {
    fontSize: 14,
    color: '#374151',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  paymentsButton: {
    backgroundColor: '#1a56db',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  paymentsButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
