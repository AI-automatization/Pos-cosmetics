import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { customersApi, type Customer } from '../../api/customers.api';

// ─── Constants ──────────────────────────────────────────
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

const C = {
  white: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  mutedLight: '#9CA3AF',
  border: '#E5E7EB',
  bg: '#F3F4F6',
  primary: '#2563EB',
  red: '#DC2626',
  redBg: '#FEE2E2',
  handleBar: '#E5E7EB',
};

// ─── Props ──────────────────────────────────────────────
interface Props {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSelect: (customer: Customer) => void;
}

// ─── Component ──────────────────────────────────────────
export default function CustomerSearchSheet({ visible, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Reset state when sheet opens
  useEffect(() => {
    if (visible) {
      setQuery('');
      setDebouncedQuery('');
    }
  }, [visible]);

  // Debounce search query
  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const enabled = debouncedQuery.length >= MIN_QUERY_LENGTH;

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customer-search', debouncedQuery],
    queryFn: () => customersApi.search(debouncedQuery),
    enabled,
    staleTime: 30_000,
  });

  const handleSelect = useCallback(
    (customer: Customer) => {
      onSelect(customer);
      onClose();
    },
    [onSelect, onClose],
  );

  const renderItem = useCallback(
    ({ item }: { item: Customer }) => (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.rowInfo}>
          <Text style={styles.rowName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.phone ? (
            <Text style={styles.rowPhone}>{item.phone}</Text>
          ) : null}
        </View>
        {item.debtBalance > 0 ? (
          <View style={styles.debtBadge}>
            <Text style={styles.debtBadgeText}>
              {item.debtBalance.toLocaleString()} qarz
            </Text>
          </View>
        ) : null}
        <Ionicons name="chevron-forward" size={16} color={C.mutedLight} />
      </TouchableOpacity>
    ),
    [handleSelect],
  );

  const keyExtractor = useCallback((item: Customer) => item.id, []);

  const showEmpty = enabled && !isLoading && (!customers || customers.length === 0);
  const showHint = !enabled && !isLoading;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mijoz tanlash</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color={C.muted} />
            </TouchableOpacity>
          </View>

          {/* Search input */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={C.mutedLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ism yoki telefon raqam..."
              placeholderTextColor={C.mutedLight}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={C.mutedLight} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Content */}
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="small" color={C.primary} />
            </View>
          ) : showHint ? (
            <View style={styles.center}>
              <Ionicons name="person-outline" size={36} color={C.mutedLight} />
              <Text style={styles.hintText}>Kamida 2 ta harf kiriting</Text>
            </View>
          ) : showEmpty ? (
            <View style={styles.center}>
              <Ionicons name="search-outline" size={36} color={C.mutedLight} />
              <Text style={styles.hintText}>Mijoz topilmadi</Text>
            </View>
          ) : (
            <FlatList
              data={customers}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
            />
          )}

          {/* Skip button */}
          <TouchableOpacity style={styles.skipBtn} activeOpacity={0.7} onPress={onClose}>
            <Text style={styles.skipText}>Mijoz qo'shmasdan davom etish</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheetWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: {
    backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 34, maxHeight: '75%',
  },
  handle: {
    width: 40, height: 5, borderRadius: 3, backgroundColor: C.handleBar,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: C.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg,
    borderRadius: 12, paddingHorizontal: 12, height: 48, gap: 8, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: C.text, paddingVertical: 0 },
  list: { flexGrow: 0 },
  row: {
    flexDirection: 'row', alignItems: 'center', height: 56,
    borderBottomWidth: 1, borderBottomColor: C.border, gap: 8,
  },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '600', color: C.text },
  rowPhone: { fontSize: 13, color: C.muted, marginTop: 2 },
  debtBadge: { backgroundColor: C.redBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  debtBadgeText: { fontSize: 11, fontWeight: '700', color: C.red },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 8 },
  hintText: { fontSize: 14, color: C.mutedLight, fontWeight: '500' },
  skipBtn: {
    alignItems: 'center', justifyContent: 'center', height: 48,
    borderRadius: 14, borderWidth: 1, borderColor: C.border, marginTop: 16,
  },
  skipText: { fontSize: 15, fontWeight: '600', color: C.muted },
});
