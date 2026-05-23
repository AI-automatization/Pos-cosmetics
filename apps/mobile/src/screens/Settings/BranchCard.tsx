import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Branch } from '../../api/branches.api';
import { styles } from './BranchesScreen.styles';

// ─── StatChip ─────────────────────────────────────────

interface StatChipProps {
  readonly label: string;
  readonly value: number;
  readonly color: string;
  readonly bg: string;
}

export function StatChip({ label, value, color, bg }: StatChipProps) {
  return (
    <View style={[styles.statChip, { backgroundColor: bg }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ─── BranchCard ───────────────────────────────────────

interface BranchCardProps {
  readonly branch: Branch;
  readonly onEdit: (branch: Branch) => void;
  readonly onToggleActive: (branch: Branch) => void;
  readonly onDelete: (branch: Branch) => void;
}

export default function BranchCard({ branch, onEdit, onToggleActive, onDelete }: BranchCardProps) {
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
