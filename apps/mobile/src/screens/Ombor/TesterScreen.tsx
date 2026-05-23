// Ombor — TesterScreen: tester/sample history list
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { TesterMovement } from '../../api/inventory.api';
import TesterCard from './TesterCard';
import NewTesterSheet from './NewTesterSheet';
import { C } from './OmborColors';

// ─── Helpers ──────────────────────────────────────────────

function fmtPrice(n: number): string {
  return n.toLocaleString('uz-UZ').replace(/,/g, ' ');
}

// ─── Screen ───────────────────────────────────────────────

export default function TesterScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [showSheet, setShowSheet] = useState(false);

  const testers = useQuery({
    queryKey: ['testers'],
    queryFn: () => inventoryApi.getTesters(),
    staleTime: 30_000,
  });

  const items = testers.data?.items ?? [];
  const totalCost = testers.data?.totalCost ?? 0;
  const count = testers.data?.count ?? 0;

  const handleNewSuccess = useCallback(() => {
    setShowSheet(false);
    queryClient.invalidateQueries({ queryKey: ['testers'] });
    queryClient.invalidateQueries({ queryKey: ['ombor-stock'] });
  }, [queryClient]);

  const renderItem = useCallback(
    ({ item }: { item: TesterMovement }) => <TesterCard item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: TesterMovement) => item.id, []);

  // ── Error state ─────────────────────────────────────────
  if (testers.isError) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerBackBtn}
          >
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tester / Namuna</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.centerFill}>
          <Text style={styles.errorText}>Ma'lumot yuklanmadi</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => testers.refetch()}
            activeOpacity={0.75}
          >
            <Text style={styles.retryBtnText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main render ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerBackBtn}
        >
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Tester / Namuna</Text>
          {!testers.isLoading && (
            <Text style={styles.headerSub}>
              {count} ta  ·  {fmtPrice(totalCost)} UZS
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setShowSheet(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.headerAddBtn}
        >
          <Ionicons name="add-circle" size={28} color={C.orange} />
        </TouchableOpacity>
      </View>

      {/* Summary card */}
      {!testers.isLoading && count > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconWrap}>
            <Ionicons name="flask-outline" size={24} color={C.orange} />
          </View>
          <View style={styles.summaryBody}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Jami testerlar:</Text>
              <Text style={styles.summaryValue}>{count}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Umumiy xarajat:</Text>
              <Text style={styles.summaryValueBold}>
                {fmtPrice(totalCost)} UZS
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={testers.isLoading}
        onRefresh={() => testers.refetch()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          testers.isLoading ? (
            <View style={styles.centerFill}>
              <ActivityIndicator size="large" color={C.orange} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="flask-outline" size={48} color={C.muted} />
              <Text style={styles.emptyText}>Hali tester ochilmagan</Text>
            </View>
          )
        }
      />

      {/* New Tester Sheet */}
      <NewTesterSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onSuccess={handleNewSuccess}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────

const ORANGE_TINT = '#FFF7ED';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerBackBtn: { minWidth: 48, minHeight: 48, alignItems: 'flex-start', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  headerRight: { minWidth: 48 },
  headerAddBtn: { minWidth: 48, minHeight: 48, alignItems: 'flex-end', justifyContent: 'center' },

  // Summary card
  summaryCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.white,
    marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.border, gap: 12,
  },
  summaryIconWrap: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: ORANGE_TINT,
    alignItems: 'center', justifyContent: 'center',
  },
  summaryBody: { flex: 1, gap: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: C.secondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: C.text },
  summaryValueBold: { fontSize: 14, fontWeight: '700', color: C.orange },

  // List
  listContent: { paddingTop: 12, paddingBottom: 32 },

  // States
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 80 },
  errorText: { fontSize: 15, color: C.muted },
  retryBtn: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10,
    backgroundColor: C.orange, minHeight: 48, alignItems: 'center', justifyContent: 'center',
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
  emptyState: { paddingTop: 60, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: C.muted },
});
