// RestockRequestsScreen — Warehouse staff view of incoming restock requests (LOW_STOCK notifications)
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi, type Alert } from '../../api/alerts.api';

const C = {
  bg: '#F9FAFB', white: '#FFFFFF', text: '#111827', muted: '#9CA3AF',
  border: '#E5E7EB', primary: '#2563EB', orange: '#F97316', green: '#16A34A',
};

type FilterTab = 'ALL' | 'UNREAD' | 'READ';

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Hozirgina';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function RequestCard({
  item,
  onMarkRead,
  isMarking,
}: {
  item: Alert;
  onMarkRead: (id: string) => void;
  isMarking: boolean;
}): React.JSX.Element {
  const productName = (item.metadata?.productName as string) ?? item.title;
  const currentStock = item.metadata?.currentStock as number | undefined;

  return (
    <View style={[styles.card, !item.isRead && styles.cardUnread]}>
      {/* Left indicator */}
      {!item.isRead && <View style={styles.unreadDot} />}

      <View style={styles.cardBody}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="arrow-up-circle" size={20} color={C.orange} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{productName}</Text>
            <Text style={styles.cardTime}>{fmtDate(item.createdAt)}</Text>
          </View>
          {currentStock !== undefined && (
            <View style={styles.stockBadge}>
              <Text style={styles.stockBadgeText}>{currentStock}</Text>
              <Text style={styles.stockBadgeLabel}>dona</Text>
            </View>
          )}
        </View>

        {/* Message */}
        <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>

        {/* Branch */}
        {item.branchName && (
          <View style={styles.branchRow}>
            <Ionicons name="business-outline" size={12} color={C.muted} />
            <Text style={styles.branchText}>{item.branchName}</Text>
          </View>
        )}

        {/* Action */}
        {!item.isRead && (
          <TouchableOpacity
            style={[styles.acceptBtn, isMarking && styles.acceptBtnDisabled]}
            onPress={() => onMarkRead(item.id)}
            disabled={isMarking}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
            <Text style={styles.acceptBtnText}>Qabul qildim</Text>
          </TouchableOpacity>
        )}

        {item.isRead && (
          <View style={styles.readBadge}>
            <Ionicons name="checkmark-done" size={14} color={C.green} />
            <Text style={styles.readBadgeText}>Qabul qilingan</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function RestockRequestsScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>('UNREAD');
  const [markingId, setMarkingId] = useState<string | null>(null);

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['restock-requests'],
    queryFn: async () => {
      try {
        return await alertsApi.getRestockRequests();
      } catch {
        return [] as Alert[];
      }
    },
    staleTime: 30_000,
    retry: false,
  });

  const markMutation = useMutation({
    mutationFn: (id: string) => alertsApi.markAsRead(id),
    onSuccess: () => {
      setMarkingId(null);
      void queryClient.invalidateQueries({ queryKey: ['restock-requests'] });
      void queryClient.invalidateQueries({ queryKey: ['alerts-active'] });
    },
    onError: () => {
      setMarkingId(null);
      RNAlert.alert('Xatolik', "O'qilgan deb belgilashda xatolik.");
    },
  });

  const handleMarkRead = (id: string) => {
    setMarkingId(id);
    markMutation.mutate(id);
  };

  const filtered = useMemo(() => {
    if (activeTab === 'UNREAD') return data.filter((a) => !a.isRead);
    if (activeTab === 'READ') return data.filter((a) => a.isRead);
    return data;
  }, [data, activeTab]);

  const unreadCount = useMemo(() => data.filter((a) => !a.isRead).length, [data]);

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'UNREAD', label: `Yangi (${unreadCount})` },
    { key: 'ALL', label: 'Barchasi' },
    { key: 'READ', label: 'Qabul qilingan' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>To'ldirish so'rovlari</Text>
          <Text style={styles.headerSub}>{unreadCount} ta yangi so'rov</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => { void refetch(); }}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={20} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RequestCard
            item={item}
            onMarkRead={handleMarkRead}
            isMarking={markingId === item.id}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={() => { void refetch(); }} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name={isLoading ? 'hourglass-outline' : 'checkmark-circle-outline'}
              size={48}
              color={C.muted}
            />
            <Text style={styles.emptyTitle}>
              {isLoading ? 'Yuklanmoqda...' : "So'rov yo'q"}
            </Text>
            <Text style={styles.emptyDesc}>
              {isLoading
                ? ''
                : activeTab === 'UNREAD'
                  ? 'Barcha so\'rovlar qabul qilingan'
                  : 'Hali hech qanday so\'rov kelmagan'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: C.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: C.muted },
  tabTextActive: { color: C.white },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: C.orange,
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    left: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.orange,
    zIndex: 1,
  },
  cardBody: { padding: 14, gap: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  cardTime: { fontSize: 11, color: C.muted, marginTop: 1 },
  stockBadge: { alignItems: 'center' },
  stockBadgeText: { fontSize: 18, fontWeight: '800', color: '#DC2626' },
  stockBadgeLabel: { fontSize: 10, color: C.muted },
  cardMessage: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  branchRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  branchText: { fontSize: 11, color: C.muted },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.green,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  acceptBtnDisabled: { opacity: 0.5 },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  readBadgeText: { fontSize: 12, color: C.green, fontWeight: '600' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.muted },
  emptyDesc: { fontSize: 13, color: C.muted, textAlign: 'center' },
});
