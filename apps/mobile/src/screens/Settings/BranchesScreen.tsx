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
  Switch,
  TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesApi } from '../../api/branches.api';
import type { Branch, CreateBranchBody } from '../../api/branches.api';

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
}

function FormField({ label, value, onChangeText, placeholder, keyboardType }: FormFieldProps) {
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
      />
    </View>
  );
}

// ─── BranchFormSheet ──────────────────────────────────

interface BranchFormSheetProps {
  readonly visible: boolean;
  readonly branch: Branch | null;
  readonly onClose: () => void;
  readonly onSave: (body: CreateBranchBody) => void;
  readonly isSaving: boolean;
}

function BranchFormSheet({ visible, branch, onClose, onSave, isSaving }: BranchFormSheetProps) {
  const [name, setName]       = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone]     = useState('');

  useEffect(() => {
    if (visible) {
      setName(branch?.name ?? '');
      setAddress(branch?.address ?? '');
      setPhone(branch?.phone ?? '');
    }
  }, [visible, branch]);

  const isNew   = !branch;
  const canSave = name.trim().length > 0 && address.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim() || undefined,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
                  {isNew ? 'Yangi filial' : 'Tahrirlash'}
                </Text>
                <TouchableOpacity style={fStyles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <FormField
                  label="Nomi"
                  value={name}
                  onChangeText={setName}
                  placeholder="Filial nomini kiriting"
                />
                <FormField
                  label="Manzil"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Manzilni kiriting"
                />
                <FormField
                  label="Telefon (ixtiyoriy)"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+998901234567"
                  keyboardType="phone-pad"
                />

                <TouchableOpacity
                  style={[fStyles.saveBtn, (!canSave || isSaving) && fStyles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={!canSave || isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={fStyles.saveBtnText}>{isNew ? "Qo'shish" : 'Saqlash'}</Text>
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

// ─── BranchCard ───────────────────────────────────────

interface BranchCardProps {
  readonly branch: Branch;
  readonly onEdit: (branch: Branch) => void;
  readonly onToggleActive: (branch: Branch) => void;
  readonly onDelete: (branch: Branch) => void;
}

function BranchCard({ branch, onEdit, onToggleActive, onDelete }: BranchCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <Ionicons name="business-outline" size={20} color="#2563EB" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{branch.name}</Text>
          <Text style={styles.cardAddress} numberOfLines={1}>{branch.address}</Text>
          {branch.phone ? (
            <Text style={styles.cardPhone}>{branch.phone}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.cardActions}>
        <Switch
          value={branch.isActive}
          onValueChange={() => onToggleActive(branch)}
          trackColor={{ false: '#E5E7EB', true: '#BBF7D0' }}
          thumbColor={branch.isActive ? '#16A34A' : '#9CA3AF'}
          style={styles.switch}
        />
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onEdit(branch)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="pencil-outline" size={16} color="#2563EB" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDelete]}
          onPress={() => onDelete(branch)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── BranchesScreen ───────────────────────────────────

export default function BranchesScreen() {
  const qc = useQueryClient();

  const { data: branches = [], isLoading } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: branchesApi.getAll,
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (body: CreateBranchBody) => branchesApi.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['branches'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CreateBranchBody> }) =>
      branchesApi.update(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['branches'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      branchesApi.toggleActive(id, isActive),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['branches'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => branchesApi.remove(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['branches'] });
    },
  });

  const [search, setSearch]           = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editBranch, setEditBranch]   = useState<Branch | null>(null);

  const total    = branches.length;
  const active   = branches.filter((b) => b.isActive).length;
  const inactive = total - active;

  const filtered = branches.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q) ||
      (b.phone ?? '').includes(search)
    );
  });

  const handleAdd = () => {
    setEditBranch(null);
    setFormVisible(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditBranch(branch);
    setFormVisible(true);
  };

  const handleToggle = (branch: Branch) => {
    toggleMutation.mutate({ id: branch.id, isActive: !branch.isActive });
  };

  const handleDelete = (branch: Branch) => {
    Alert.alert(
      "O'chirish",
      `"${branch.name}" filialini o'chirishni tasdiqlaysizmi?`,
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: "O'chirish",
          style: 'destructive',
          onPress: () => removeMutation.mutate(branch.id),
        },
      ],
    );
  };

  const handleSave = (body: CreateBranchBody) => {
    if (editBranch) {
      updateMutation.mutate(
        { id: editBranch.id, body },
        { onSuccess: () => setFormVisible(false) },
      );
    } else {
      createMutation.mutate(body, {
        onSuccess: () => setFormVisible(false),
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const ListHeader = (
    <View style={styles.listHeader}>
      <View style={styles.statsRow}>
        <StatChip label="Jami"   value={total}    color="#2563EB" bg="#EFF6FF" />
        <StatChip label="Faol"   value={active}   color="#16A34A" bg="#F0FDF4" />
        <StatChip label="Nofaol" value={inactive} color="#9CA3AF" bg="#F3F4F6" />
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Nomi yoki manzil..."
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

      <Text style={styles.resultCount}>{filtered.length} ta filial</Text>
    </View>
  );

  const ListEmpty = isLoading ? (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  ) : (
    <View style={styles.empty}>
      <Ionicons name="business-outline" size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>Filial topilmadi</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filiallar</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.75}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <BranchCard
            branch={item}
            onEdit={handleEdit}
            onToggleActive={handleToggle}
            onDelete={handleDelete}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={ListEmpty}
      />

      <BranchFormSheet
        visible={formVisible}
        branch={editBranch}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
        isSaving={isSaving}
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  cardAddress: {
    fontSize: 13,
    color: '#6B7280',
  },
  cardPhone: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDelete: {
    backgroundColor: '#FEE2E2',
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
