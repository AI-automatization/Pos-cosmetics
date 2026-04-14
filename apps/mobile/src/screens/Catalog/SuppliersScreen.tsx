import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../../components/common/SearchBar';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:      '#F9FAFB',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
  red:     '#DC2626',
};

// ─── Types ─────────────────────────────────────────────
interface Supplier {
  id: string;
  name: string;
  phone: string;
  company: string;
  address: string;
}

// ─── SupplierFormSheet ─────────────────────────────────
function SupplierFormSheet({
  visible,
  supplier,
  onClose,
  onSaved,
}: {
  visible: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSaved: (s: Omit<Supplier, 'id'>) => void;
}) {
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setName(supplier?.name ?? '');
      setPhone(supplier?.phone ?? '');
      setCompany(supplier?.company ?? '');
      setAddress(supplier?.address ?? '');
    }
  }, [visible, supplier]);

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSaved({ name: name.trim(), phone, company, address });
      onClose();
    }, 500);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={sheet.backdrop} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={sheet.wrapper}
      >
        <View style={sheet.panel}>
          <View style={sheet.handle} />

          <View style={sheet.header}>
            <View style={sheet.iconCircle}>
              <Ionicons name="business-outline" size={22} color={C.primary} />
            </View>
            <Text style={sheet.title}>
              {supplier ? 'Yetkazib beruvchini tahrirlash' : 'Yangi yetkazib beruvchi'}
            </Text>
          </View>

          <FormRow label="Ism *">
            <TextInput
              style={sheet.input}
              value={name}
              onChangeText={setName}
              placeholder="Abdullayev Jamshid"
              placeholderTextColor={C.muted}
            />
          </FormRow>
          <FormRow label="Telefon">
            <TextInput
              style={sheet.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+998 90 000 00 00"
              placeholderTextColor={C.muted}
              keyboardType="phone-pad"
            />
          </FormRow>
          <FormRow label="Kompaniya">
            <TextInput
              style={sheet.input}
              value={company}
              onChangeText={setCompany}
              placeholder="Jamshid Group LLC"
              placeholderTextColor={C.muted}
            />
          </FormRow>
          <FormRow label="Manzil">
            <TextInput
              style={sheet.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Toshkent, Chilonzor tumani"
              placeholderTextColor={C.muted}
            />
          </FormRow>

          <TouchableOpacity
            style={[sheet.saveBtn, !canSave && sheet.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!canSave || loading}
          >
            {loading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={sheet.saveBtnText}>
                  {supplier ? 'Saqlash' : "Qo'shish"}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={sheet.row}>
      <Text style={sheet.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ─── SupplierCard ──────────────────────────────────────
function SupplierCard({
  supplier,
  onEdit,
  onDelete,
}: {
  supplier: Supplier;
  onEdit: (s: Supplier) => void;
  onDelete: (s: Supplier) => void;
}) {
  const handleMenu = () => {
    Alert.alert(supplier.name, undefined, [
      { text: 'Tahrirlash', onPress: () => onEdit(supplier) },
      {
        text: "O'chirish",
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            "O'chirishni tasdiqlang",
            `"${supplier.name}" o'chirilsinmi?`,
            [
              { text: 'Bekor', style: 'cancel' },
              { text: "O'chirish", style: 'destructive', onPress: () => onDelete(supplier) },
            ],
          ),
      },
      { text: 'Bekor qilish', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="business" size={22} color={C.primary} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.supplierName}>{supplier.name}</Text>
        {supplier.company ? (
          <Text style={styles.supplierCompany}>{supplier.company}</Text>
        ) : null}
        {supplier.phone ? (
          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={13} color={C.muted} />
            <Text style={styles.metaText}>{supplier.phone}</Text>
          </View>
        ) : null}
        {supplier.address ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color={C.muted} />
            <Text style={styles.metaText} numberOfLines={1}>{supplier.address}</Text>
          </View>
        ) : null}
      </View>
      <TouchableOpacity style={styles.menuBtn} onPress={handleMenu} activeOpacity={0.7}>
        <Ionicons name="ellipsis-vertical" size={18} color={C.muted} />
      </TouchableOpacity>
    </View>
  );
}

// ─── SuppliersScreen ───────────────────────────────────
export default function SuppliersScreen() {
  const [search, setSearch]           = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [suppliers, setSuppliers]     = useState<Supplier[]>([]);

  const filtered = useMemo(() => {
    if (!search.trim()) return suppliers;
    const q = search.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.company.toLowerCase().includes(q) ||
        s.phone.includes(q),
    );
  }, [suppliers, search]);

  const handleAdd = () => {
    setEditSupplier(null);
    setSheetVisible(true);
  };

  const handleEdit = (s: Supplier) => {
    setEditSupplier(s);
    setSheetVisible(true);
  };

  const handleDelete = (s: Supplier) => {
    setSuppliers((prev) => prev.filter((x) => x.id !== s.id));
  };

  const handleSaved = (data: Omit<Supplier, 'id'>) => {
    if (editSupplier) {
      setSuppliers((prev) =>
        prev.map((s) => (s.id === editSupplier.id ? { ...s, ...data } : s)),
      );
    } else {
      setSuppliers((prev) => [...prev, { id: Date.now().toString(), ...data }]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Yetkazib beruvchilar</Text>
          <Text style={styles.headerCount}>{suppliers.length} ta</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* SearchBar */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Ism, kompaniya yoki telefon..."
        />
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <SupplierCard
            supplier={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={44} color={C.muted} />
            <Text style={styles.emptyTitle}>
              {search ? 'Topilmadi' : 'Yetkazib beruvchilar yo\'q'}
            </Text>
            {!search && (
              <TouchableOpacity style={styles.emptyBtn} onPress={handleAdd}>
                <Text style={styles.emptyBtnText}>Birinchisini qo'shish</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <SupplierFormSheet
        visible={sheetVisible}
        supplier={editSupplier}
        onClose={() => setSheetVisible(false)}
        onSaved={handleSaved}
      />
    </SafeAreaView>
  );
}

// ─── Sheet styles ───────────────────────────────────────
const sheet = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  panel: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center', marginBottom: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconCircle: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: C.text },
  row: { marginBottom: 12 },
  rowLabel: { fontSize: 12, fontWeight: '600', color: C.muted, marginBottom: 6 },
  input: {
    height: 48, backgroundColor: C.bg, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 14, fontSize: 15, color: C.text,
  },
  saveBtn: {
    backgroundColor: C.primary, borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  saveBtnDisabled: { backgroundColor: '#E5E7EB', shadowOpacity: 0, elevation: 0 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

// ─── Screen styles ──────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  headerCount: { fontSize: 12, color: C.muted, marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },
  searchWrap: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  listContent: { padding: 16, paddingBottom: 40 },
  separator: { height: 10 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: C.white, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14, gap: 12,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 3 },
  supplierName: { fontSize: 15, fontWeight: '700', color: C.text },
  supplierCompany: { fontSize: 13, fontWeight: '500', color: C.muted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  metaText: { fontSize: 12, color: C.muted, flex: 1 },
  menuBtn: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 15, color: C.muted, fontWeight: '600' },
  emptyBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: C.primary, borderRadius: 10,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
