import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '@/navigation/types';
import { customersApi } from '@/api/customers.api';
import ErrorView from '@/components/common/ErrorView';
import { DebtPaySheet } from './DebtPaySheet';
import { useCustomerDebts } from '../../hooks/customers/useCustomerDebts';
import type { DebtRecord } from '../../api/nasiya.api';
import { useScreenProtection } from '../../hooks/useScreenProtection';
import { DebtItem, InfoRow, StatCard, infoStyles } from './CustomerDetailComponents';
import { styles, C } from './CustomerDetailScreen.styles';

// ─── Types ─────────────────────────────────────────────
type RouteProps = RouteProp<MoreStackParamList, 'CustomerDetail'>;
type Nav = NativeStackNavigationProp<MoreStackParamList, 'CustomerDetail'>;

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}

function getInitials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}

function genderLabel(gender: 'MALE' | 'FEMALE' | null): string {
  if (gender === 'MALE') return 'Erkak';
  if (gender === 'FEMALE') return 'Ayol';
  return '—';
}

// ─── CustomerDetailScreen ─────────────────────────────
export default function CustomerDetailScreen() {
  useScreenProtection();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { customerId, customerName } = route.params;

  const [payingDebt, setPayingDebt] = useState<DebtRecord | null>(null);

  const {
    data: customer,
    isLoading: loadingCustomer,
    error: errorCustomer,
    refetch: refetchCustomer,
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customersApi.getById(customerId),
    staleTime: 60_000,
  });

  const {
    data: stats,
    isLoading: loadingStats,
    error: errorStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['customer-stats', customerId],
    queryFn: () => customersApi.getStats(customerId),
    staleTime: 60_000,
  });

  const { data: debts = [] } = useCustomerDebts(customerId);
  const activeDebts = debts.filter((d) => Number(d.remaining) > 0);

  const isLoading = loadingCustomer || loadingStats;
  const anyError  = errorCustomer ?? errorStats;

  if (anyError) {
    return (
      <ErrorView
        error={anyError}
        onRetry={() => { void refetchCustomer(); void refetchStats(); }}
      />
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
        <Text style={styles.headerTitle} numberOfLines={1}>{customerName}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Avatar & name hero */}
          <View style={styles.hero}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>
                {getInitials(customer?.name ?? customerName)}
              </Text>
            </View>
            <Text style={styles.heroName}>{customer?.name ?? customerName}</Text>
            {customer && (
              <View style={[
                styles.statusBadge,
                customer.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
              ]}>
                <Text style={[
                  styles.statusBadgeText,
                  customer.isActive ? styles.statusBadgeTextActive : styles.statusBadgeTextInactive,
                ]}>
                  {customer.isActive ? 'Faol' : 'Nofaol'}
                </Text>
              </View>
            )}
          </View>

          {/* Stats */}
          {stats && (
            <>
              <Text style={styles.sectionLabel}>STATISTIKA</Text>
              <View style={styles.statsRow}>
                <StatCard
                  label="Buyurtmalar"
                  value={stats.orderCount.toLocaleString('ru-RU') + ' ta'}
                />
                <StatCard
                  label="Jami xarid"
                  value={stats.totalSpent >= 1_000_000
                    ? (stats.totalSpent / 1_000_000).toFixed(1) + ' mln'
                    : stats.totalSpent.toLocaleString('ru-RU')}
                />
                <StatCard
                  label="Nasiya"
                  value={stats.debtBalance > 0
                    ? (stats.debtBalance / 1_000).toFixed(0) + ' ming'
                    : '0'}
                  accent={stats.debtBalance > 0 ? C.red : C.green}
                />
              </View>
            </>
          )}

          {/* Contact info */}
          {customer && (
            <>
              <Text style={styles.sectionLabel}>KONTAKT MA'LUMOTLAR</Text>
              <View style={styles.card}>
                <InfoRow
                  icon="call-outline"
                  label="Telefon"
                  value={customer.phone ?? '—'}
                />
                <View style={styles.divider} />
                <InfoRow
                  icon="mail-outline"
                  label="Email"
                  value={customer.email ?? '—'}
                />
                <View style={styles.divider} />
                <InfoRow
                  icon="location-outline"
                  label="Manzil"
                  value={customer.address ?? '—'}
                />
                <View style={styles.divider} />
                <InfoRow
                  icon="person-outline"
                  label="Jinsi"
                  value={genderLabel(customer.gender)}
                />
              </View>

              {/* Financial info */}
              <Text style={styles.sectionLabel}>MOLIYAVIY MA'LUMOTLAR</Text>
              <View style={styles.card}>
                <InfoRow
                  icon="wallet-outline"
                  label="Nasiya balansi"
                  value={fmt(customer.debtBalance)}
                  valueColor={customer.debtBalance > 0 ? C.red : C.green}
                />
                <View style={styles.divider} />
                <View style={infoStyles.row}>
                  <View style={infoStyles.iconWrap}>
                    <Ionicons name="shield-checkmark-outline" size={16} color={C.primary} />
                  </View>
                  <View style={infoStyles.body}>
                    <Text style={infoStyles.label}>Nasiya limiti</Text>
                    <Text style={infoStyles.value}>{fmt(customer.debtLimit)}</Text>
                    {customer.debtLimit > 0 && (
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${Math.min(100, (customer.debtBalance / customer.debtLimit) * 100)}%`,
                              backgroundColor: customer.debtBalance > customer.debtLimit ? '#ef4444' : '#3b82f6',
                            },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Active debts */}
              <Text style={styles.sectionLabel}>FAOL QARZLAR</Text>
              {activeDebts.length === 0 ? (
                <View style={styles.emptyDebtsWrap}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={C.green} />
                  <Text style={styles.emptyDebtsText}>Qarz yo'q</Text>
                </View>
              ) : (
                <View style={styles.debtsWrap}>
                  <FlatList
                    data={activeDebts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <DebtItem debt={item} onPay={setPayingDebt} />
                    )}
                    scrollEnabled={false}
                  />
                </View>
              )}

              {/* Notes */}
              {customer.notes ? (
                <>
                  <Text style={styles.sectionLabel}>IZOHLAR</Text>
                  <View style={styles.card}>
                    <View style={styles.notesWrap}>
                      <Text style={styles.notesText}>{customer.notes}</Text>
                    </View>
                  </View>
                </>
              ) : null}
            </>
          )}
        </ScrollView>
      )}

      {payingDebt && (
        <DebtPaySheet
          debt={{
            id: payingDebt.id,
            totalAmount: Number(payingDebt.totalAmount),
            remaining: Number(payingDebt.remaining),
            orderNumber: payingDebt.orderId,
          }}
          onClose={() => setPayingDebt(null)}
        />
      )}
    </SafeAreaView>
  );
}
