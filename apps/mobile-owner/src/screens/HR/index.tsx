import React, { useState } from 'react';
import { View, TouchableOpacity, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenLayout from '../../components/layout/ScreenLayout';
import HREmployeeRow from './HREmployeeRow';
import HRInviteSheet from './HRInviteSheet';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useHRData } from './useHRData';
import { Employee, EmployeeStatus, CreateEmployeeDto } from '../../api/employees.api';
import { EmployeesStackParamList } from '../../navigation/types';
import { Colors, Radii } from '../../config/theme';

type Nav = NativeStackNavigationProp<EmployeesStackParamList>;
type FilterTab = 'all' | 'active' | 'inactive';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: 'Barchasi' },
  { key: 'active',   label: 'Faol' },
  { key: 'inactive', label: 'Nofaol' },
];

export default function HRScreen() {
  const navigation = useNavigation<Nav>();
  const { employees, toggleStatus, inviteEmployee } = useHRData();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showInvite, setShowInvite] = useState(false);

  const allEmployees = employees.data ?? [];
  const filtered: Employee[] = filter === 'all'
    ? allEmployees
    : allEmployees.filter((e) => filter === 'active' ? e.status === 'active' : e.status !== 'active');

  const activeCount = allEmployees.filter((e) => e.status === 'active').length;
  const inactiveCount = allEmployees.filter((e) => e.status !== 'active').length;

  function handleToggle(id: string, newStatus: EmployeeStatus) {
    toggleStatus.mutate({ id, status: newStatus }, {
      onError: () => Alert.alert('Xato', "Holat o'zgartirishda xatolik"),
    });
  }

  function handleInviteSubmit(dto: CreateEmployeeDto) {
    inviteEmployee.mutate(dto, {
      onSuccess: (emp) => {
        setShowInvite(false);
        Alert.alert('Muvaffaqiyat', `${emp.firstName} ${emp.lastName} qo'shildi.\nInvite link Telegram orqali yuboriladi.`);
      },
      onError: () => Alert.alert('Xato', "Xodim qo'shishda xatolik"),
    });
  }

  const addButton = (
    <TouchableOpacity onPress={() => setShowInvite(true)} style={styles.addBtn}>
      <Ionicons name="person-add-outline" size={22} color={Colors.primary} />
    </TouchableOpacity>
  );

  return (
    <ScreenLayout title="Xodimlar (HR)" rightAction={addButton}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{allEmployees.length}</Text>
          <Text style={styles.statLabel}>Jami</Text>
        </View>
        <View style={[styles.statCard, styles.statGreen]}>
          <Text style={[styles.statValue, { color: Colors.success }]}>{activeCount}</Text>
          <Text style={styles.statLabel}>Faol</Text>
        </View>
        <View style={[styles.statCard, styles.statRed]}>
          <Text style={[styles.statValue, { color: Colors.danger }]}>{inactiveCount}</Text>
          <Text style={styles.statLabel}>Nofaol</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, filter === tab.key && styles.tabActive]}
            onPress={() => setFilter(tab.key)}
          >
            <Text style={[styles.tabText, filter === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {employees.isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList<Employee>
          data={filtered}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <HREmployeeRow
              employee={item}
              onToggleStatus={handleToggle}
              onPress={() =>
                navigation.navigate('EmployeeDetail', {
                  employeeId: item.id,
                  employeeName: item.fullName,
                })
              }
            />
          )}
          refreshing={employees.isFetching}
          onRefresh={() => { void employees.refetch(); }}
          ListEmptyComponent={<EmptyState message="Xodimlar topilmadi" />}
        />
      )}

      <HRInviteSheet
        visible={showInvite}
        onClose={() => setShowInvite(false)}
        onSubmit={handleInviteSubmit}
        isLoading={inviteEmployee.isPending}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  addBtn: { padding: 4 },
  statsRow: {
    flexDirection: 'row', gap: 8, padding: 12,
    backgroundColor: Colors.bgSurface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radii.md, backgroundColor: Colors.bgSubtle },
  statGreen: { backgroundColor: Colors.successLight },
  statRed: { backgroundColor: Colors.dangerLight },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', marginTop: 2 },
  tabs: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 6,
    backgroundColor: Colors.bgSurface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tab: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radii.sm, backgroundColor: Colors.bgSubtle },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: Colors.textWhite },
});
