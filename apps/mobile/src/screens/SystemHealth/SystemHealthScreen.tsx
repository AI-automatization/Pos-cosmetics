import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { systemApi, type ServiceStatus, type SystemError } from '../../api/system.api';

const C = {
  bg: '#F9FAFB', white: '#FFFFFF', text: '#111827', muted: '#9CA3AF',
  border: '#E5E7EB', primary: '#2563EB',
  green: '#16A34A', greenBg: '#D1FAE5',
  orange: '#D97706', orangeBg: '#FEF3C7',
  red: '#DC2626', redBg: '#FEE2E2',
};

function statusColor(status: ServiceStatus['status']) {
  if (status === 'healthy')  return { bg: C.greenBg,  text: C.green  };
  if (status === 'degraded') return { bg: C.orangeBg, text: C.orange };
  return                            { bg: C.redBg,    text: C.red    };
}

function statusLabel(status: ServiceStatus['status']) {
  if (status === 'healthy')  return 'Ishlayapti';
  if (status === 'degraded') return 'Sekin';
  return 'Xato';
}

function ServiceCard({ name, svc }: { name: string; svc: ServiceStatus | undefined }) {
  if (!svc) return null;
  const col = statusColor(svc.status);
  return (
    <View style={s.serviceCard}>
      <Text style={s.serviceName}>{name}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {svc.responseMs != null && (
          <Text style={s.responseMs}>{svc.responseMs}ms</Text>
        )}
        <View style={[s.statusBadge, { backgroundColor: col.bg }]}>
          <Text style={[s.statusText, { color: col.text }]}>{statusLabel(svc.status)}</Text>
        </View>
      </View>
    </View>
  );
}

function ErrorRow({ err }: { err: SystemError }) {
  const col = err.level === 'error'
    ? { bg: C.redBg, text: C.red }
    : { bg: C.orangeBg, text: C.orange };
  return (
    <View style={s.errRow}>
      <View style={[s.levelBadge, { backgroundColor: col.bg }]}>
        <Text style={[s.levelText, { color: col.text }]}>{err.level.toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.errMsg} numberOfLines={2}>{err.message}</Text>
        <Text style={s.errMeta}>{err.service} · {err.occurredAt ? new Date(err.occurredAt).toLocaleDateString('uz-UZ') : '—'}</Text>
      </View>
    </View>
  );
}

export default function SystemHealthScreen(): React.JSX.Element {
  const navigation = useNavigation();

  const health = useQuery({
    queryKey: ['system-health'],
    queryFn: systemApi.getHealth,
    staleTime: 30_000,
  });

  const errors = useQuery({
    queryKey: ['system-errors'],
    queryFn: () => systemApi.getErrors(20),
    staleTime: 30_000,
  });

  const handleRefresh = async () => {
    await Promise.all([health.refetch(), errors.refetch()]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Sistema holati</Text>
        <View style={{ width: 36 }} />
      </View>

      {health.isLoading ? (
        <ActivityIndicator style={s.loader} size="large" color={C.primary} />
      ) : health.isError ? (
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={44} color={C.muted} />
          <Text style={s.muted}>Ma'lumot yuklanmadi</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => { void health.refetch(); }}>
            <Text style={s.retryText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          refreshControl={
            <RefreshControl
              refreshing={health.isFetching}
              onRefresh={() => { void handleRefresh(); }}
            />
          }
        >
          {/* Services */}
          <Text style={s.sectionTitle}>Xizmatlar</Text>
          <View style={s.card}>
            {health.data != null && (
              <>
                <ServiceCard name="API"             svc={health.data.apiStatus}      />
                <View style={s.divider} />
                <ServiceCard name="Ma'lumotlar bazasi" svc={health.data.databaseStatus} />
                <View style={s.divider} />
                <ServiceCard name="Worker"          svc={health.data.workerStatus}   />
                <View style={s.divider} />
                <ServiceCard name="Fiskal adapter"  svc={health.data.fiscalStatus}   />
              </>
            )}
          </View>

          {/* Errors */}
          <Text style={s.sectionTitle}>So'nggi xatolar</Text>
          <View style={s.card}>
            {errors.isLoading ? (
              <ActivityIndicator style={{ padding: 20 }} color={C.primary} />
            ) : (errors.data ?? []).length === 0 ? (
              <View style={s.emptyRow}>
                <Ionicons name="checkmark-circle-outline" size={24} color={C.green} />
                <Text style={[s.muted, { color: C.green }]}>Xato yo'q</Text>
              </View>
            ) : (
              (errors.data ?? []).map((err, i) => (
                <React.Fragment key={err.id}>
                  {i > 0 && <View style={s.divider} />}
                  <ErrorRow err={err} />
                </React.Fragment>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  loader: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  muted: { fontSize: 14, color: C.muted, fontWeight: '500' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: C.primary },
  retryText: { fontSize: 14, fontWeight: '700', color: C.white },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 8, marginTop: 8,
  },
  card: {
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', marginBottom: 16,
  },
  divider: { height: 1, backgroundColor: C.border },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  serviceName: { fontSize: 14, fontWeight: '600', color: C.text },
  responseMs: { fontSize: 12, color: C.muted },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  errRow: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  levelText: { fontSize: 10, fontWeight: '700' },
  errMsg: { fontSize: 13, color: C.text, fontWeight: '500', marginBottom: 3 },
  errMeta: { fontSize: 11, color: C.muted },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 20, justifyContent: 'center' },
});
