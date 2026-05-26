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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchesApi } from '../../api/branches.api';
import type { Branch, CreateBranchBody } from '../../api/branches.api';
import BranchCard, { StatChip } from './BranchCard';
import BranchFormSheet from './BranchFormSheet';
import { styles } from './BranchesScreen.styles';

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
