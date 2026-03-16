import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useBranchStore } from '../../store/branch.store';
import BranchSelectorSheet from './BranchSelectorSheet';

export default function HeaderBranchSelector() {
  const { t } = useTranslation();
  const { selectedBranchId, branches } = useBranchStore();
  const [sheetVisible, setSheetVisible] = useState(false);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);
  const label = selectedBranch ? selectedBranch.name : t('common.allBranches');

  return (
    <>
      <TouchableOpacity style={styles.button} onPress={() => setSheetVisible(true)}>
        <Ionicons name="storefront-outline" size={16} color="#2563EB" />
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        <Ionicons name="chevron-down" size={14} color="#2563EB" />
      </TouchableOpacity>
      <BranchSelectorSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    gap: 5,
    maxWidth: 200,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    flex: 1,
  },
});
