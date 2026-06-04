import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { salesApi } from '../../api/sales.api';
import SearchBar from '../../components/common/SearchBar';
import ErrorView from '@/components/common/ErrorView';
import OrderDetailSheet from './OrderDetailSheet';
import { useScreenProtection } from '../../hooks/useScreenProtection';
import {
  C,
  PERIODS,
  METHODS,
  getPeriodDates,
  fmt,
  type PeriodKey,
  type MethodKey,
  type OrderWithMethod,
} from './paymentsHistory.helpers';
import { PaymentCard } from './PaymentCard';
import { PaymentsStatCard } from './PaymentsStatCard';
import { styles } from './PaymentsHistoryScreen.styles';

// ─── PaymentsHistoryScreen ─────────────────────────────
export default function PaymentsHistoryScreen() {
  useScreenProtection();
  const navigation                  = useNavigation();
  const [period, setPeriod]         = useState<PeriodKey>('30d');
  const [method, setMethod]         = useState<MethodKey>('Barchasi');
  const [search, setSearch]         = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { from, to } = useMemo(() => getPeriodDates(period), [period]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', from, to],
    queryFn: () => salesApi.getOrders({ from, to, limit: 500 }),
    staleTime: 3 * 60_000,
  });

  const orders = data?.data ?? [];

  const filtered = useMemo(() => {
    let list = orders;

    // Client-side date filter (backend T-423 hali from/to qo'llab-quvvatlamaydi)
    const fromMs = new Date(from + 'T00:00:00').getTime();
    const toMs = new Date(to + 'T23:59:59').getTime();
    list = list.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= fromMs && t <= toMs;
    });

    // search by order number
    if (search.trim()) {
      const q = search.replace(/^#/, '').trim();
      list = list.filter((o) => String(o.orderNumber).includes(q));
    }

    // method filter (client-side -- paymentMethod mavjud bo'lsa ishlaydi)
    if (method !== 'Barchasi') {
      const methodMap: Record<string, string[]> = {
        Naqd:  ['NAQD', 'CASH'],
        Karta: ['KARTA', 'CARD', 'TERMINAL'],
        Nasiya: ['NASIYA', 'DEBT'],
        Click: ['CLICK'],
        Payme: ['PAYME'],
      };
      const allowed = methodMap[method] ?? [];
      list = list.filter((o) =>
        allowed.includes((o as OrderWithMethod).paymentMethod ?? ''),
      );
    }

    return list;
  }, [orders, search, method, from, to]);

  // Stat cards -- payment method bo'yicha
  const statCards = useMemo(() => {
    const cash = filtered.filter((o) =>
      ['NAQD', 'CASH'].includes((o as OrderWithMethod).paymentMethod ?? ''),
    );
    const card = filtered.filter((o) =>
      ['KARTA', 'CARD', 'TERMINAL'].includes(
        (o as OrderWithMethod).paymentMethod ?? '',
      ),
    );
    const debt = filtered.filter((o) =>
      ['NASIYA', 'DEBT'].includes((o as OrderWithMethod).paymentMethod ?? ''),
    );
    return [
      {
        label: 'Naqd',
        sum: cash.reduce((s, o) => s + Number(o.total), 0),
        count: cash.length,
        color: '#16A34A',
        bg: '#F0FDF4',
      },
      {
        label: 'Karta',
        sum: card.reduce((s, o) => s + Number(o.total), 0),
        count: card.length,
        color: '#7C3AED',
        bg: '#F5F3FF',
      },
      {
        label: 'Nasiya',
        sum: debt.reduce((s, o) => s + Number(o.total), 0),
        count: debt.length,
        color: '#D97706',
        bg: '#FFFBEB',
      },
    ];
  }, [filtered]);

  // Summary stats
  const totalCompleted = useMemo(
    () => filtered.filter((o) => o.status === 'COMPLETED').reduce((s, o) => s + Number(o.total), 0),
    [filtered],
  );
  const completedCount = filtered.filter((o) => o.status === 'COMPLETED').length;

  if (error) return <ErrorView error={error} onRetry={() => void refetch()} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>To'lovlar tarixi</Text>
            <Text style={styles.headerSub}>{filtered.length} ta yozuv</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Buyurtma raqami..."
        />
      </View>

      {/* Period pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsScroll}
        contentContainerStyle={styles.pillsRow}
      >
        {PERIODS.map((p) => {
          const active = p.key === period;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Method filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsScroll}
        contentContainerStyle={styles.pillsRow}
      >
        {METHODS.map((m) => {
          const active = m.key === method;
          return (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.methodPill,
                active && styles.methodPillActive,
              ]}
              onPress={() => setMethod(m.key)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={m.icon}
                size={14}
                color={active ? C.white : C.muted}
              />
              <Text style={[styles.methodPillText, active && styles.methodPillTextActive]}>
                {m.key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedOrderId(item.id)}
            >
              <PaymentCard
                orderNumber={item.orderNumber}
                status={item.status}
                total={item.total}
                createdAt={item.createdAt}
                customerId={item.customerId}
              />
            </TouchableOpacity>
          )}
          style={styles.flatList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            <View>
              {/* Stat cards */}
              <View style={styles.statRow}>
                {statCards.map((c) => (
                  <PaymentsStatCard key={c.label} {...c} />
                ))}
              </View>

              {/* Summary strip */}
              {filtered.length > 0 && (
                <View style={styles.summaryStrip}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Jami tushum</Text>
                    <Text style={styles.summaryValue}>{fmt(totalCompleted)}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Bajarildi</Text>
                    <Text style={[styles.summaryValue, { color: C.green }]}>{completedCount} ta</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Jami</Text>
                    <Text style={styles.summaryValue}>{filtered.length} ta</Text>
                  </View>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="card-outline" size={44} color={C.muted} />
              <Text style={styles.emptyTitle}>
                {search ? 'Topilmadi' : "To'lovlar yo'q"}
              </Text>
              <Text style={styles.emptySub}>Boshqa davr yoki filtr tanlang</Text>
            </View>
          }
        />
      )}

      <OrderDetailSheet
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </SafeAreaView>
  );
}
