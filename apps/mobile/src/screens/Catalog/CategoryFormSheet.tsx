import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CatalogCategory } from '../../api/catalog.api';
import { C, sheet } from './CategoriesScreen.styles';

// ─── CategoryFormSheet ─────────────────────────────────
interface CategoryFormSheetProps {
  readonly visible: boolean;
  readonly categories: CatalogCategory[];
  readonly editCategory: CatalogCategory | null;
  readonly loading: boolean;
  readonly onClose: () => void;
  readonly onSave: (name: string, parentId: string | null) => void;
}

export default function CategoryFormSheet({
  visible,
  categories,
  editCategory,
  loading,
  onClose,
  onSave,
}: CategoryFormSheetProps) {
  const [name, setName]         = useState(editCategory?.name ?? '');
  const [parentId, setParentId] = useState<string | null>(editCategory?.parentId ?? null);

  React.useEffect(() => {
    if (visible) {
      setName(editCategory?.name ?? '');
      setParentId(editCategory?.parentId ?? null);
    }
  }, [visible, editCategory]);

  const parentName = categories.find((c) => c.id === parentId)?.name ?? null;

  const handleParentPick = () => {
    const roots = categories.filter((c) => !c.parentId && c.id !== editCategory?.id);
    Alert.alert('Ota kategoriyani tanlang', undefined, [
      { text: "Yo'q (asosiy)", onPress: () => setParentId(null) },
      ...roots.map((c) => ({ text: c.name, onPress: () => setParentId(c.id) })),
      { text: 'Bekor qilish', style: 'cancel' as const },
    ]);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), parentId);
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
              <Ionicons name="folder-outline" size={22} color={C.primary} />
            </View>
            <Text style={sheet.title}>
              {editCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
            </Text>
          </View>

          <Text style={sheet.fieldLabel}>KATEGORIYA NOMI *</Text>
          <TextInput
            style={sheet.input}
            value={name}
            onChangeText={setName}
            placeholder="Masalan: Kremlar"
            placeholderTextColor={C.muted}
            autoFocus={visible}
          />

          <Text style={sheet.fieldLabel}>OTA KATEGORIYA</Text>
          <TouchableOpacity style={sheet.selectRow} onPress={handleParentPick}>
            <Ionicons name="folder-open-outline" size={18} color={C.muted} />
            <Text style={[sheet.selectText, !parentName && sheet.selectPlaceholder]}>
              {parentName ?? "Yo'q (asosiy kategoriya)"}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[sheet.saveBtn, !name.trim() && sheet.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!name.trim() || loading}
          >
            {loading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={sheet.saveBtnText}>
                  {editCategory ? 'Saqlash' : "Qo'shish"}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
