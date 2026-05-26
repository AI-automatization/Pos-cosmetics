import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Task, TaskStatus } from '../../api/tasks.api';

// ─── Types ─────────────────────────────────────────────────
interface TaskCardProps {
  readonly task:     Task;
  readonly onStatus: (id: string, next: TaskStatus) => void;
  readonly onDelete: (id: string) => void;
}

// ─── Status config ─────────────────────────────────────────
const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  PENDING:     'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE:        'PENDING',
};
const STATUS_ICON: Record<TaskStatus, React.ComponentProps<typeof Ionicons>['name']> = {
  PENDING:     'ellipse-outline',
  IN_PROGRESS: 'time-outline',
  DONE:        'checkmark-circle',
};
const STATUS_COLOR: Record<TaskStatus, string> = {
  PENDING:     '#9CA3AF',
  IN_PROGRESS: '#2563EB',
  DONE:        '#16A34A',
};

// ─── TaskCard ──────────────────────────────────────────────
const TaskCard = React.memo(function TaskCard({ task, onStatus, onDelete }: TaskCardProps) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.statusBtn}
        onPress={() => onStatus(task.id, NEXT_STATUS[task.status])}
      >
        <Ionicons name={STATUS_ICON[task.status]} size={22} color={STATUS_COLOR[task.status]} />
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={[styles.title, task.status === 'DONE' && styles.done]} numberOfLines={2}>
          {task.title}
        </Text>
        {task.description != null && task.description.length > 0 && (
          <Text style={styles.desc} numberOfLines={2}>{task.description}</Text>
        )}
        <View style={styles.meta}>
          {task.assignee != null && (
            <View style={styles.metaChip}>
              <Ionicons name="person-outline" size={12} color="#6B7280" />
              <Text style={styles.metaText}>{task.assignee.firstName} {task.assignee.lastName}</Text>
            </View>
          )}
          {task.dueDate != null && (
            <View style={styles.metaChip}>
              <Ionicons name="calendar-outline" size={12} color="#6B7280" />
              <Text style={styles.metaText}>{new Date(task.dueDate).toLocaleDateString('uz-UZ')}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(task.id)}
      >
        <Ionicons name="trash-outline" size={18} color="#DC2626" />
      </TouchableOpacity>
    </View>
  );
});

export default TaskCard;

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
    padding: 14, gap: 12,
  },
  statusBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  body:      { flex: 1, gap: 5 },
  title:     { fontSize: 15, fontWeight: '600', color: '#111827', lineHeight: 20 },
  done:      { textDecorationLine: 'line-through', color: '#9CA3AF' },
  desc:      { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  meta:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaChip:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:  { fontSize: 11, color: '#6B7280' },
  deleteBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
