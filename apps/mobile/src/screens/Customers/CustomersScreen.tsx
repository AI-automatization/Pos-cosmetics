import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MoreStackParamList } from '@/navigation/types';
import { customersApi } from '@/api/customers.api';
import type { Customer } from '@/api/customers.api';
import ErrorView from '@/components/common/ErrorView';
import EmptyState from '@/components/common/EmptyState';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  red:     '#DC2626',
  redBg:   '#FEF2F2',
  avatarBg: '#EFF6FF',
};

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}

function getInitials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}

// ─── CustomerCard ──────────────────────────────────────
type Nav = NativeStackNavigationProp<MoreStackParamList, 'CustomersScreen'>;

interface CustomerCardProps {
  customer: Customer;
  onPress: (customer: Customer) => void;
}

const CustomerCard = React.memo(function CustomerCard({ customer, onPress }: CustomerCardProps) {
  const hasDebt = customer.debtBalance > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(customer)}
      activeOpacity={0.75}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(customer.name)}</Text>
      </View>

      {/* Info */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{customer.name}</Text>
        {customer.phone ? (
          <Text style={styles.cardPhone}>{customer.phone}</Text>
        ) : (
          <Text style={styles.cardPhoneMuted}>Telefon yo'q</Text>
        )}
      </View>

      {/* Debt badge */}
      {hasDebt && (
        <View style={styles.debtBadge}>
          <Text style={styles.debtBadgeText}>Nasiya: {fmt(customer.debtBalance)}</Text>
        </View>
      )}

      <Ionicons name="chevron-forward" size={16} color={C.muted} />
    </TouchableOpacity>
  );
});

// ─── CustomersScreen ───────────────────────────────────
export default function CustomersScreen() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customersApi.search(search),
    staleTime: 30_000,
  });

  const handleCustomerPress = useCallback(
    (customer: Customer) => {
      navigation.navigate('CustomerDetail', {
        customerId: customer.id,
        customerName: customer.name,
      });
    },
    [navigation],
  );

  const handleClearSearch = useCallback(() => {
    setSearch('');
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Customer }) => (
      <CustomerCard customer={item} onPress={handleCustomerPress} />
    ),
    [handleCustomerPress],
  );

  const keyExtractor = useCallback((item: Customer) => item.id, []);

  if (error) {
    return <ErrorView error={error} onRetry={() => void refetch()} />;
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
        <Text style={styles.headerTitle}>Mijozlar</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color={C.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ism yoki telefon..."
            placeholderTextColor={C.muted}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={C.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <ActivityIndicator size="large" color={C.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={data.length === 0 ? styles.listEmpty : styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={
            data.length > 0 ? (
              <Text style={styles.resultCount}>{data.length} ta mijoz</Text>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Ionicons name="people-outline" size={48} color={C.muted} />}
              title="Mijoz topilmadi"
              description={search.length > 0 ? `"${search}" bo'yicha natija yo'q` : 'Hali mijoz qo\'shilmagan'}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text },
  headerPlaceholder: { width: 36 },

  // Search
  searchWrapper: {
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  // List
  listContent: { paddingTop: 4, paddingBottom: 40 },
  listEmpty: { flex: 1 },
  loader: { marginTop: 40 },
  separator: { height: 1, backgroundColor: C.border, marginHorizontal: 16 },
  resultCount: {
    fontSize: 11,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },

  // Customer card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.primary,
  },
  cardBody: { flex: 1, gap: 2 },
  cardName: { fontSize: 15, fontWeight: '600', color: C.text },
  cardPhone: { fontSize: 13, color: C.muted },
  cardPhoneMuted: { fontSize: 13, color: C.border },
  debtBadge: {
    backgroundColor: C.redBg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  debtBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.red,
  },
});
