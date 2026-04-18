import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../api/audit.api';
import type { AuditLog } from '../../api/audit.api';

type ActionFilter = 'ALL' | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';

// ─── Constants ────────────────────────────────────────

const ACTION_CONFIG: Record<
  'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN',
  { label: string; text: string; bg: string }
> = {
  CREATE: { label: 'Yaratish',  text: '#16A34A', bg: '#F0FDF4' },
  UPDATE: { label: 'Tahrirlash', text: '#2563EB', bg: '#EFF6FF' },
  DELETE: { label: "O'chirish",  text: '#EF4444', bg: '#FEE2E2' },
  LOGIN:  { label: 'Kirish',     text: '#6B7280', bg: '#F3F4F6' },
};

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

// ─── Helpers ──────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) +
    ' ' +
    d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
  );
}

// ─── ActionBadge ──────────────────────────────────────

interface ActionBadgeProps {
  readonly action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
}

function ActionBadge({ action }: ActionBadgeProps) {
  const cfg = ACTION_CONFIG[action];
  return (
    <View style={[badgeStyles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[badgeStyles.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});

// ─── JsonPreview ──────────────────────────────────────

interface JsonPreviewProps {
  readonly label: string;
  readonly data: Record<string, unknown>;
  readonly bgColor: string;
  readonly textColor: string;
}

function JsonPreview({ label, data, bgColor, textColor }: JsonPreviewProps) {
  return (
    <View style={[previewStyles.container, { backgroundColor: bgColor }]}>
      <Text style={[previewStyles.label, { color: textColor }]}>{label}</Text>
      <ScrollView style={previewStyles.scroll} nestedScrollEnabled>
        <Text style={previewStyles.json}>{JSON.stringify(data, null, 2)}</Text>
      </ScrollView>
    </View>
  );
}

const previewStyles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  scroll: {
    maxHeight: 120,
  },
  json: {
    fontSize: 11,
    color: '#374151',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

// ─── AuditLogCard ─────────────────────────────────────

interface AuditLogCardProps {
  readonly log: AuditLog;
}

function AuditLogCard({ log }: AuditLogCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDetail = Boolean(log.oldValue ?? log.newValue);

  const entityLabel = log.entityId
    ? `${log.entityType}: ${log.entityId}`
    : log.entityType;

  return (
    <TouchableOpacity
      style={cardStyles.card}
      onPress={() => setExpanded((prev) => !prev)}
      activeOpacity={0.8}
    >
      <View style={cardStyles.row}>
        <ActionBadge action={log.action} />
        <View style={cardStyles.info}>
          <Text style={cardStyles.entity} numberOfLines={1}>
            {entityLabel}
          </Text>
          <Text style={cardStyles.meta}>
            {log.userName}
            {log.branchName ? ` · ${log.branchName}` : ''}
          </Text>
        </View>
        <View style={cardStyles.right}>
          <Text style={cardStyles.date}>{formatDate(log.createdAt)}</Text>
          {hasDetail && (
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color="#9CA3AF"
              style={cardStyles.chevron}
            />
          )}
        </View>
      </View>

      {expanded && hasDetail && (
        <View style={cardStyles.detail}>
          {log.oldValue && (
            <JsonPreview
              label="Eski qiymat"
              data={log.oldValue}
              bgColor="#FEE2E2"
              textColor="#EF4444"
            />
          )}
          {log.newValue && (
            <JsonPreview
              label="Yangi qiymat"
              data={log.newValue}
              bgColor="#F0FDF4"
              textColor="#16A34A"
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  entity: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  meta: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  chevron: {
    marginTop: 2,
  },
  detail: {
    marginTop: 10,
    gap: 0,
  },
});

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

// ─── Styles ───────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  listHeader: {
    gap: 8,
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  actionFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  resultCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  separator: {
    height: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
  },
  errorText: {
    fontSize: 15,
    color: '#EF4444',
  },
  retryBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
});
