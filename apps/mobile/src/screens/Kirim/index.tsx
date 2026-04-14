// KirimScreen — asosiy kirim ekrani

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Receipt } from '../../api/inventory.api';
import { useKirimData } from './useKirimData';
import ShiftGuard from '../../components/common/ShiftGuard';
import { useAuthStore } from '../../store/auth.store';
import NewReceiptSheet from './NewReceiptSheet';
import { DetailSheet } from './KirimDetailSheet';
import { ReceiptCard } from './KirimReceiptCard';
import { KirimListHeader } from './KirimListHeader';
import { C, KIRIM_ROLES } from './KirimColors';
import type { FilterTab } from './KirimTypes';
import TransferSheet from './TransferSheet';

export default function KirimScreen() {
  const [search, setSearch]            = useState('');
  const [selected, setSelected]        = useState<Receipt | null>(null);
  const [detailVisible, setDetail]     = useState(false);
  const [activeTab, setActiveTab]      = useState<FilterTab>('ALL');
  const [newSheetVisible, setNewSheet]         = useState(false);
  const [transferSheetVisible, setTransferSheet] = useState(false);
  const listRef                        = useRef<FlatList<Receipt>>(null);

  const { user }  = useAuthStore();
  const hasAccess = KIRIM_ROLES.includes(user?.role as typeof KIRIM_ROLES[number]);

  const { list, create, transfer, accept, cancel } = useKirimData();
  const allReceipts      = list.data?.items ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allReceipts.filter((r) => {
      const matchSearch =
        r.receiptNumber.toLowerCase().includes(q) ||
        r.supplierName.toLowerCase().includes(q);
      const matchTab = activeTab === 'ALL' || r.status === activeTab;
      return matchSearch && matchTab;
    });
  }, [search, activeTab, allReceipts]);

  if (!hasAccess) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kirimlar</Text>
        </View>
        <View style={styles.centerFill}>
          <Ionicons name="lock-closed-outline" size={48} color={C.muted} />
          <Text style={styles.errorText}>Bu bo'lim uchun ruxsat yo'q</Text>
          <Text style={styles.errorTextSmall}>Kerakli rol: Warehouse, Manager, Admin</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (list.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kirimlar</Text>
        </View>
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (list.isError) {
    const is403 = (list.error as { response?: { status?: number } })?.response?.status === 403;
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kirimlar</Text>
        </View>
        <View style={styles.centerFill}>
          <Ionicons
            name={is403 ? 'lock-closed-outline' : 'alert-circle-outline'}
            size={48}
            color={C.muted}
          />
          <Text style={styles.errorText}>
            {is403 ? "Bu bo'lim uchun ruxsat yo'q" : "Ma'lumot yuklanmadi"}
          </Text>
          {!is403 && (
            <TouchableOpacity style={styles.retryBtn} onPress={() => list.refetch()} activeOpacity={0.75}>
              <Text style={styles.retryBtnText}>Qayta urinish</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const openDetail = (receipt: Receipt) => {
    setSelected(receipt);
    setDetail(true);
  };

  const handleAccept = (id: string) => {
    Alert.alert(
      'Qabul qilish',
      "Kirimni qabul qilishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.",
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: 'Qabul qilish',
          onPress: () => {
            accept.mutate(id, {
              onSuccess: () => setDetail(false),
            });
          },
        },
      ],
    );
  };

  const handleCancel = (id: string) => {
    Alert.alert(
      'Bekor qilish',
      "Kirimni bekor qilishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.",
      [
        { text: "Yo'q", style: 'cancel' },
        {
          text: 'Bekor qilish',
          style: 'destructive',
          onPress: () => {
            cancel.mutate(id, {
              onSuccess: () => setDetail(false),
            });
          },
        },
      ],
    );
  };

  const handleAddPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Bekor qilish", "Yetkazib beruvchidan kirim", "Ombordan o'tkazma"],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) setNewSheet(true);
          if (idx === 2) setTransferSheet(true);
        },
      );
    } else {
      Alert.alert('Kirim turi', 'Qaysi turdagi kirim?', [
        { text: 'Bekor', style: 'cancel' },
        { text: 'Yetkazib beruvchidan', onPress: () => setNewSheet(true) },
        { text: "Ombordan o'tkazma", onPress: () => setTransferSheet(true) },
      ]);
    }
  };

  return (
    <ShiftGuard>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Kirimlar</Text>
          <TouchableOpacity
            style={styles.headerIcon}
            activeOpacity={0.7}
            onPress={handleAddPress}
          >
            <Ionicons name="add" size={22} color={C.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          data={filtered}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <KirimListHeader
              allReceipts={allReceipts}
              search={search}
              activeTab={activeTab}
              resultCount={filtered.length}
              onSearchChange={setSearch}
              onTabChange={setActiveTab}
              listRef={listRef}
            />
          }
          renderItem={({ item }) => (
            <ReceiptCard receipt={item} onPress={() => openDetail(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="archive-outline" size={48} color={C.muted} />
              <Text style={styles.emptyText}>Kirim topilmadi</Text>
            </View>
          }
        />

        <DetailSheet
          visible={detailVisible}
          receipt={selected}
          onClose={() => setDetail(false)}
          onAccept={handleAccept}
          onCancel={handleCancel}
          isAccepting={accept.isPending}
          isCancelling={cancel.isPending}
        />
        <NewReceiptSheet
          visible={newSheetVisible}
          onClose={() => setNewSheet(false)}
          onSuccess={() => setNewSheet(false)}
          createMutation={create}
        />
        <TransferSheet
          visible={transferSheetVisible}
          onClose={() => setTransferSheet(false)}
          onSuccess={() => setTransferSheet(false)}
          transferMutation={transfer}
        />
      </SafeAreaView>
    </ShiftGuard>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content:     { paddingBottom: 32 },
  centerFill:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText:   { fontSize: 15, color: C.muted },
  errorTextSmall: { fontSize: 12, color: C.muted, marginTop: -8 },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.primary,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: C.white },
  separator:    { height: 10 },
  empty:        { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText:    { fontSize: 15, color: C.muted },
});
