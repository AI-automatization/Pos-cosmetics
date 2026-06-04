import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserCard, { AppUser } from './UserCard';
import UserFormSheet from './UserFormSheet';
import PasswordResetSheet from './PasswordResetSheet';
import { usersApi, CreateUserBody, UpdateUserBody } from '../../api/users.api';
import { useAuthStore } from '../../store/auth.store';
import { getRoleLevel } from '../../utils/roles';

// ─── StatChip ─────────────────────────────────────────

interface StatChipProps {
  readonly label: string;
  readonly value: number;
  readonly color: string;
  readonly bg: string;
}

function StatChip({ label, value, color, bg }: StatChipProps) {
  return (
    <View style={[styles.statChip, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ─── UsersScreen ──────────────────────────────────────

export default function UsersScreen() {
  const qc = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const canResetPassword = getRoleLevel(currentUser?.role) >= 4; // OWNER / ADMIN

  const { data: users = [], isLoading } = useQuery<AppUser[]>({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserBody }) =>
      usersApi.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.toggleActive(id, isActive),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const resetPwMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersApi.resetPassword(id, newPassword),
    onSuccess: () => {
      Alert.alert('Muvaffaqiyat', 'Parol muvaffaqiyatli tiklandi');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Xatolik yuz berdi';
      Alert.alert('Xatolik', msg);
    },
  });

  const [search, setSearch]           = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editUser, setEditUser]       = useState<AppUser | null>(null);
  const [resetPwUser, setResetPwUser] = useState<AppUser | null>(null);

  const total    = users.length;
  const active   = users.filter((u) => u.isActive).length;
  const inactive = total - active;

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      (u.phone ?? '').includes(search)
    );
  });

  const handleEdit = (u: AppUser) => {
    setEditUser(u);
    setFormVisible(true);
  };

  const handleToggle = (u: AppUser) => {
    toggleMutation.mutate({ id: u.id, isActive: !u.isActive });
  };

  const handleAdd = () => {
    setEditUser(null);
    setFormVisible(true);
  };

  const handleSave = (body: CreateUserBody) => {
    if (editUser) {
      const updateBody: UpdateUserBody = {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        role: body.role,
      };
      updateMutation.mutate(
        { id: editUser.id, body: updateBody },
        { onSuccess: () => setFormVisible(false) },
      );
    } else {
      createMutation.mutate(body, {
        onSuccess: () => setFormVisible(false),
      });
    }
  };

  const handleResetPassword = (u: AppUser) => {
    setResetPwUser(u);
  };

  const handleResetSave = (newPassword: string) => {
    if (!resetPwUser) return;
    resetPwMutation.mutate({ id: resetPwUser.id, newPassword }, {
      onSuccess: () => setResetPwUser(null),
    });
  };

  const ListHeader = (
    <View style={styles.listHeader}>
      <View style={styles.statsRow}>
        <StatChip label="Jami"   value={total}    color="#2563EB" bg="#EFF6FF" />
        <StatChip label="Faol"   value={active}   color="#16A34A" bg="#F0FDF4" />
        <StatChip label="Nofaol" value={inactive} color="#9CA3AF" bg="#F3F4F6" />
      </View>

      <View style={styles.searchRow}>
        <Ionicons
          name="search-outline"
          size={16}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Ism yoki telefon..."
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

      <Text style={styles.resultCount}>{filtered.length} ta foydalanuvchi</Text>
    </View>
  );

  const ListEmpty = isLoading ? (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  ) : (
    <View style={styles.empty}>
      <Ionicons name="people-outline" size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>Foydalanuvchi topilmadi</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Foydalanuvchilar</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAdd}
          activeOpacity={0.75}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(u) => u.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onEdit={handleEdit}
            onToggleActive={handleToggle}
            onResetPassword={canResetPassword ? handleResetPassword : undefined}
            isSelf={item.id === currentUser?.id}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={ListEmpty}
      />

      <UserFormSheet
        visible={formVisible}
        user={editUser}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      <PasswordResetSheet
        visible={resetPwUser !== null}
        user={resetPwUser}
        onClose={() => setResetPwUser(null)}
        onSave={handleResetSave}
        isSaving={resetPwMutation.isPending}
      />
    </SafeAreaView>
  );
}

// ─── Main styles ──────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  listHeader: {
    gap: 12,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  searchRow: {
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
    paddingTop: 60,
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
