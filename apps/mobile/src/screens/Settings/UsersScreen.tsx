import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserCard, { AppUser, UserRole, ROLE_CONFIG } from './UserCard';
import { usersApi, CreateUserBody } from '../../api/users.api';

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

// ─── FormField ────────────────────────────────────────

interface FormFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly placeholder: string;
  readonly keyboardType?: TextInputProps['keyboardType'];
  readonly secureTextEntry?: boolean;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
}: FormFieldProps) {
  return (
    <View style={fStyles.fieldWrap}>
      <Text style={fStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={fStyles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

// ─── UserFormSheet ────────────────────────────────────

interface UserFormSheetProps {
  readonly visible: boolean;
  readonly user: AppUser | null;
  readonly onClose: () => void;
  readonly onSave: (body: CreateUserBody) => void;
  readonly isSaving: boolean;
}

function UserFormSheet({
  visible,
  user,
  onClose,
  onSave,
  isSaving,
}: UserFormSheetProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState<UserRole>('CASHIER');

  useEffect(() => {
    if (visible) {
      setFirstName(user?.firstName ?? '');
      setLastName(user?.lastName ?? '');
      setPhone(user?.phone ?? '');
      setPassword('');
      setRole(user?.role ?? 'CASHIER');
    }
  }, [visible, user]);

  const isNew = !user;
  const canSave =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    (isNew ? password.trim().length > 0 : true);

  const pickRole = () => {
    const roles: UserRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'VIEWER'];
    Alert.alert(
      'Rol tanlash',
      undefined,
      [
        ...roles.map((r) => ({
          text: ROLE_CONFIG[r].label,
          onPress: () => setRole(r),
        })),
        { text: 'Bekor', style: 'cancel' as const },
      ],
    );
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: '',
      phone: phone.trim() || undefined,
      password,
      role,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={fStyles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={fStyles.kavWrapper}
          >
            <View style={fStyles.sheet}>
              <View style={fStyles.handle} />

              <View style={fStyles.sheetHeader}>
                <Text style={fStyles.sheetTitle}>
                  {isNew ? 'Yangi foydalanuvchi' : 'Tahrirlash'}
                </Text>
                <TouchableOpacity style={fStyles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <FormField
                  label="Ism"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Ism kiriting"
                />
                <FormField
                  label="Familiya"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Familiya kiriting"
                />
                <FormField
                  label="Telefon"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+998901234567"
                  keyboardType="phone-pad"
                />
                {isNew && (
                  <FormField
                    label="Parol"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Parol kiriting"
                    secureTextEntry
                  />
                )}

                <Text style={fStyles.fieldLabel}>Rol</Text>
                <TouchableOpacity
                  style={fStyles.rolePicker}
                  onPress={pickRole}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      fStyles.rolePickerBadge,
                      { backgroundColor: ROLE_CONFIG[role].bg },
                    ]}
                  >
                    <Text
                      style={[
                        fStyles.rolePickerBadgeText,
                        { color: ROLE_CONFIG[role].text },
                      ]}
                    >
                      {ROLE_CONFIG[role].label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    fStyles.saveBtn,
                    (!canSave || isSaving) && fStyles.saveBtnDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={!canSave || isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={fStyles.saveBtnText}>
                      {isNew ? "Qo'shish" : 'Saqlash'}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── UsersScreen ──────────────────────────────────────

export default function UsersScreen() {
  const qc = useQueryClient();

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

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.toggleActive(id, isActive),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const [search, setSearch]           = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editUser, setEditUser]       = useState<AppUser | null>(null);

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
    createMutation.mutate(body, {
      onSuccess: () => setFormVisible(false),
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
        isSaving={createMutation.isPending}
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

// ─── Form sheet styles ────────────────────────────────

const fStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  kavWrapper: {
    width: '100%',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  rolePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
  },
  rolePickerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rolePickerBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
