import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useBranchStore } from '../../store/branch.store';
import { Branch } from '../../api/branches.api';

interface BranchSelectorSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function BranchSelectorSheet({ visible, onClose }: BranchSelectorSheetProps) {
  const { t } = useTranslation();
  const { selectedBranchId, branches, selectBranch } = useBranchStore();

  function handleSelect(id: string | null) {
    selectBranch(id);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <TouchableOpacity style={styles.item} onPress={() => handleSelect(null)}>
          <Text style={styles.itemText}>{t('common.allBranches')}</Text>
          {selectedBranchId === null && <Ionicons name="checkmark" size={20} color="#2563EB" />}
        </TouchableOpacity>
        <FlatList<Branch>
          data={branches}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleSelect(item.id)}>
              <Text style={styles.itemText}>{item.name}</Text>
              {selectedBranchId === item.id && <Ionicons name="checkmark" size={20} color="#2563EB" />}
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemText: {
    fontSize: 16,
    color: '#111827',
  },
});
