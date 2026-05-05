import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../api/tasks.api';
import type { Task, TaskStatus } from '../../api/tasks.api';
import TaskCard from './TaskCard';

// ─── Colors ────────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
} as const;

const TASKS_PAGE_LIMIT = 100;

type FilterStatus = 'ALL' | TaskStatus;
const FILTERS: Array<{ key: FilterStatus; label: string }> = [
  { key: 'ALL',        label: 'Barchasi'   },
  { key: 'PENDING',    label: 'Kutilmoqda' },
  { key: 'IN_PROGRESS',label: 'Jarayonda'  },
  { key: 'DONE',       label: 'Bajarildi'  },
];

// ─── TasksScreen ───────────────────────────────────────────
export default function TasksScreen() {
  const navigation = useNavigation();
  const qc = useQueryClient();

  const [filter,  setFilter]  = useState<FilterStatus>('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [title,   setTitle]   = useState('');
  const [desc,    setDesc]    = useState('');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 'list'],
    queryFn:  () => tasksApi.list({ limit: TASKS_PAGE_LIMIT }),
  });

  const createMut = useMutation({
    mutationFn: () => tasksApi.create({ title: title.trim(), description: desc.trim() || undefined }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tasks', 'list'] });
      setShowAdd(false);
      setTitle('');
      setDesc('');
    },
    onError: () => Alert.alert('Xatolik', "Topshiriq qo'shilmadi"),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.update(id, { status }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['tasks', 'list'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['tasks', 'list'] }),
  });

  const handleStatus = useCallback(
    (id: string, status: TaskStatus) => statusMut.mutate({ id, status }),
    [statusMut],
  );

  const handleDelete = (id: string) => {
    Alert.alert("O'chirish", "Bu topshiriqni o'chirmoqchimisiz?", [
      { text: 'Bekor', style: 'cancel' },
      { text: "O'chirish", style: 'destructive', onPress: () => deleteMut.mutate(id) },
    ]);
  };

  const filtered: Task[] = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Vazifalar</Text>
          <Text style={styles.headerSub}>{tasks.length} ta topshiriq</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.addBtn}>
          <Ionicons name="add" size={22} color={C.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter pills */}
      <View style={styles.pillRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.pill, filter === f.key && styles.pillActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.pillText, filter === f.key && styles.pillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onStatus={handleStatus}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-outline" size={48} color={C.border} />
            <Text style={styles.emptyText}>Topshiriqlar yo'q</Text>
          </View>
        }
      />

      {/* Create Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Yangi topshiriq</Text>
            <TextInput
              style={styles.input}
              placeholder="Topshiriq nomi *"
              placeholderTextColor={C.muted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Tavsif (ixtiyoriy)"
              placeholderTextColor={C.muted}
              value={desc}
              onChangeText={setDesc}
              multiline
              numberOfLines={3}
            />
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={[styles.sheetBtn, styles.cancelBtn]}
                onPress={() => { setShowAdd(false); setTitle(''); setDesc(''); }}
              >
                <Text style={styles.cancelText}>Bekor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sheetBtn, styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}
                onPress={() => createMut.mutate()}
                disabled={!title.trim() || createMut.isPending}
              >
                <Text style={styles.saveText}>
                  {createMut.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:     { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', marginLeft: -8 },
  headerText:  { flex: 1, marginLeft: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerSub:   { fontSize: 12, color: C.muted, marginTop: 2 },
  addBtn:      { width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#EFF6FF' },

  pillRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  pill:          { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.bg },
  pillActive:    { backgroundColor: C.primary, borderColor: C.primary },
  pillText:      { fontSize: 13, fontWeight: '600', color: C.muted },
  pillTextActive:{ color: C.white },

  list:      { padding: 16, gap: 10, paddingBottom: 40 },
  empty:     { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: C.muted },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, gap: 12,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: C.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: C.text,
  },
  inputMulti:      { minHeight: 80, textAlignVertical: 'top' },
  sheetActions:    { flexDirection: 'row', gap: 10, marginTop: 4 },
  sheetBtn:        { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn:       { backgroundColor: '#F3F4F6' },
  saveBtn:         { backgroundColor: C.primary },
  saveBtnDisabled: { opacity: 0.5 },
  cancelText:      { fontSize: 15, fontWeight: '700', color: '#374151' },
  saveText:        { fontSize: 15, fontWeight: '700', color: C.white },
});
