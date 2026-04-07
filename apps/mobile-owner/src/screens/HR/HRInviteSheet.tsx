import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, ScrollView, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreateEmployeeDto, EmployeeRole } from '../../api/employees.api';
import { useBranchStore } from '../../store/branch.store';
import { Colors, Radii } from '../../config/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateEmployeeDto) => void;
  isLoading: boolean;
}

const ROLES: { value: EmployeeRole; label: string }[] = [
  { value: 'cashier', label: 'Kassir' },
  { value: 'manager', label: 'Menejer' },
  { value: 'admin', label: 'Admin' },
];

export default function HRInviteSheet({ visible, onClose, onSubmit, isLoading }: Props) {
  const branches = useBranchStore((s) => s.branches);
  const selectedBranchId = useBranchStore((s) => s.selectedBranchId);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<EmployeeRole>('cashier');
  const [branchId, setBranchId] = useState(selectedBranchId ?? '');

  function handleSubmit() {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) return;
    const login = `${firstName.toLowerCase().slice(0, 4)}${lastName.toLowerCase().slice(0, 3)}${Math.floor(Math.random() * 100)}`;
    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim(),
      role,
      branchId: branchId || (branches[0]?.id ?? ''),
      login,
      password: Math.random().toString(36).slice(2, 10),
      hireDate: new Date().toISOString().slice(0, 10),
      hasPosAccess: role === 'cashier',
      hasAdminAccess: role === 'admin',
      hasReportsAccess: role !== 'cashier',
    });
  }

  function handleClose() {
    setFirstName(''); setLastName(''); setEmail(''); setPhone('');
    setRole('cashier'); setBranchId(selectedBranchId ?? '');
    onClose();
  }

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0 && phone.trim().length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Xodim qo'shish</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Ism *</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Ism" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Familiya *</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Familiya" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Telefon *</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+998901234567" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor={Colors.textMuted} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>Rol</Text>
          <View style={styles.chipRow}>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.chip, role === r.value && styles.chipActive]}
                onPress={() => setRole(r.value)}
              >
                <Text style={[styles.chipText, role === r.value && styles.chipTextActive]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {branches.length > 0 && (
            <>
              <Text style={styles.label}>Filial</Text>
              <View style={styles.chipRow}>
                {branches.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.chip, branchId === b.id && styles.chipActive]}
                    onPress={() => setBranchId(b.id)}
                  >
                    <Text style={[styles.chipText, branchId === b.id && styles.chipTextActive]}>{b.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View style={styles.inviteNote}>
            <Ionicons name="paper-plane-outline" size={16} color={Colors.primary} />
            <Text style={styles.noteText}>Xodimga Telegram orqali invite link yuboriladi</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelText}>Bekor qilish</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, (!canSubmit || isLoading) && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || isLoading}
          >
            <Text style={styles.submitText}>{isLoading ? 'Yuborilmoqda...' : "Qo'shish & Invite"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgApp },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  body: { flex: 1, padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radii.md,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
    color: Colors.textPrimary, backgroundColor: Colors.bgSurface,
  },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.sm,
    backgroundColor: Colors.bgSubtle, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.textWhite },
  inviteNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 24, padding: 12, borderRadius: Radii.md,
    backgroundColor: Colors.bgSubtle, borderWidth: 1, borderColor: Colors.border,
  },
  noteText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  footer: {
    flexDirection: 'row', padding: 16, gap: 12,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.bgSurface,
  },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: Radii.md, backgroundColor: Colors.bgSubtle, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  submitBtn: { flex: 2, paddingVertical: 13, borderRadius: Radii.md, backgroundColor: Colors.primary, alignItems: 'center' },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontSize: 15, fontWeight: '700', color: Colors.textWhite },
});
