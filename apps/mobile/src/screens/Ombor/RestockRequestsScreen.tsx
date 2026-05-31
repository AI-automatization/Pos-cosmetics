// RestockRequestsScreen — Warehouse staff view of incoming restock requests
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi, type Alert } from '../../api/alerts.api';
import RestockRequestCard from './RestockRequestCard';
import { styles, RC } from './RestockRequestsScreen.styles';

type FilterTab = 'ALL' | 'UNREAD' | 'READ';

const TABS: readonly { readonly key: FilterTab; readonly labelFn: (n: number) => string }[] = [
  { key: 'UNREAD', labelFn: (n) => `Yangi (${n})` },
  { key: 'ALL', labelFn: () => 'Barchasi' },
  { key: 'READ', labelFn: () => 'Qabul qilingan' },
];

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

  const handleMarkRead = useCallback(
    (id: string) => {
      setMarkingId(id);
      markMutation.mutate(id);
    },
    [markMutation],
  );

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const filtered = useMemo(() => {
    if (activeTab === 'UNREAD') return data.filter((a) => !a.isRead);
    if (activeTab === 'READ') return data.filter((a) => a.isRead);
    return data;
  }, [data, activeTab]);

  const unreadCount = useMemo(() => data.filter((a) => !a.isRead).length, [data]);

  const renderItem = useCallback(
    ({ item }: { item: Alert }) => (
      <RestockRequestCard
        item={item}
        onMarkRead={handleMarkRead}
        isMarking={markingId === item.id}
      />
    ),
    [handleMarkRead, markingId],
  );

  const keyExtractor = useCallback((item: Alert) => item.id, []);

  const emptyComponent = useMemo(
    () => (
      <View style={styles.empty}>
        <Ionicons
          name={isLoading ? 'hourglass-outline' : 'checkmark-circle-outline'}
          size={48}
          color={RC.muted}
        />
        <Text style={styles.emptyTitle}>
          {isLoading ? 'Yuklanmoqda...' : "So'rov yo'q"}
        </Text>
        <Text style={styles.emptyDesc}>
          {isLoading
            ? ''
            : activeTab === 'UNREAD'
              ? "Barcha so'rovlar qabul qilingan"
              : "Hali hech qanday so'rov kelmagan"}
        </Text>
      </View>
    ),
    [isLoading, activeTab],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={RC.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>To'ldirish so'rovlari</Text>
          <Text style={styles.headerSub}>{unreadCount} ta yangi so'rov</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={handleRefresh}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={20} color={RC.text} />
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
              {tab.labelFn(unreadCount)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={emptyComponent}
      />
    </SafeAreaView>
  );
}
