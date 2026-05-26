import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../api/audit.api';
import type { AuditLog } from '../../api/audit.api';
import AuditLogCard from './AuditLogCard';
import { styles } from './AuditLogScreen.styles';

type ActionFilter = 'ALL' | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';

const ACTION_FILTER_OPTIONS: ActionFilter[] = [
  'ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN',
];

const ACTION_FILTER_LABELS: Record<ActionFilter, string> = {
  ALL:    'Barchasi',
  CREATE: 'Yaratish',
  UPDATE: 'Tahrirlash',
  DELETE: "O'chirish",
  LOGIN:  'Kirish',
};

// ─── AuditLogScreen ───────────────────────────────────

export default function AuditLogScreen() {
  const [search, setSearch]               = useState('');
  const [selectedAction, setSelectedAction] = useState<ActionFilter>('ALL');

  const queryAction = selectedAction === 'ALL' ? undefined : selectedAction;

  const { data: allLogs = [], isLoading, error, refetch } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs', selectedAction],
    queryFn:  () => auditApi.getAll(queryAction),
    staleTime: 30_000,
  });

  const filtered = allLogs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.entityType.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      (log.entityId ?? '').toLowerCase().includes(q) ||
      (log.branchName ?? '').toLowerCase().includes(q)
    );
  });

  const pickAction = () => {
    Alert.alert(
      'Amal tanlash',
      undefined,
      [
        ...ACTION_FILTER_OPTIONS.map((a) => ({
          text: ACTION_FILTER_LABELS[a],
          onPress: () => setSelectedAction(a),
        })),
        { text: 'Bekor', style: 'cancel' as const },
      ],
    );
  };

  const ListHeader = (
    <View style={styles.listHeader}>
      <View style={styles.filterRow}>
        <View style={styles.searchRow}>
          <Ionicons
            name="search-outline"
            size={16}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Foydalanuvchi, entity..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.actionFilterBtn}
          onPress={pickAction}
          activeOpacity={0.75}
        >
          <Text style={styles.actionFilterText}>
            {ACTION_FILTER_LABELS[selectedAction]}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <Text style={styles.resultCount}>{filtered.length} ta yozuv</Text>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Audit jurnali</Text>
        </View>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Xatolik yuz berdi</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => void refetch()}>
            <Text style={styles.retryText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const ListEmpty = isLoading ? (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  ) : (
    <View style={styles.empty}>
      <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>Yozuv topilmadi</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Audit jurnali</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(log) => log.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => <AuditLogCard log={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={ListEmpty}
      />
    </SafeAreaView>
  );
}
