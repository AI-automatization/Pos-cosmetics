import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { todayISO, daysAgoISO } from '../../utils/date';
import { C } from './SalesColors';

// ─── Types ────────────────────────────────────────────────────
export interface DateRange {
  readonly from: string;
  readonly to: string;
  readonly label: string;
}

interface DateRangeSheetProps {
  readonly visible: boolean;
  readonly selected: DateRange;
  readonly onClose: () => void;
  readonly onSelect: (range: DateRange) => void;
}

// ─── Preset helpers ───────────────────────────────────────────
function buildPresets(): DateRange[] {
  const today = new Date();
  const todayStr = todayISO();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0] as string;

  // Dushanba — haftaning birinchi kuni (getDay: 0=yak, 1=dush)
  const weekStart = new Date(today);
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setDate(today.getDate() + diffToMonday);
  const weekStartStr = weekStart.toISOString().split('T')[0] as string;

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartStr = monthStart.toISOString().split('T')[0] as string;

  return [
    { from: todayStr,      to: todayStr,   label: 'Bugun'    },
    { from: yesterdayStr,  to: yesterdayStr, label: 'Kecha'  },
    { from: weekStartStr,  to: todayStr,   label: 'Bu hafta' },
    { from: monthStartStr, to: todayStr,   label: 'Bu oy'    },
    { from: daysAgoISO(30), to: todayStr,  label: 'Oxirgi 30 kun' },
  ];
}

const PRESETS = buildPresets();

// ─── DateRangeSheet ───────────────────────────────────────────
export default function DateRangeSheet(props: DateRangeSheetProps) {
  const { visible, selected, onClose, onSelect } = props;

  function handleSelect(range: DateRange) {
    onSelect(range);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Sana oralig'i</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={20} color={C.secondary} />
          </TouchableOpacity>
        </View>

        {/* Preset buttons */}
        <View style={styles.presetsContainer}>
          {PRESETS.map((preset) => {
            const isActive = preset.label === selected.label;
            return (
              <TouchableOpacity
                key={preset.label}
                style={[styles.presetBtn, isActive && styles.presetBtnActive]}
                onPress={() => handleSelect(preset)}
                activeOpacity={0.75}
              >
                <Text style={[styles.presetLabel, isActive && styles.presetLabelActive]}>
                  {preset.label}
                </Text>
                {preset.from !== preset.to && (
                  <Text style={[styles.presetSub, isActive && styles.presetSubActive]}>
                    {preset.from} — {preset.to}
                  </Text>
                )}
                {isActive && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={C.white}
                    style={styles.presetCheck}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Yopish tugmasi */}
        <TouchableOpacity style={styles.closeFullBtn} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.closeFullBtnText}>Yopish</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  presetBtnActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  presetLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    flex: 1,
  },
  presetLabelActive: {
    color: C.white,
  },
  presetSub: {
    fontSize: 12,
    color: C.muted,
    marginRight: 4,
  },
  presetSubActive: {
    color: 'rgba(255,255,255,0.75)',
  },
  presetCheck: {
    marginLeft: 4,
  },
  closeFullBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  closeFullBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.secondary,
  },
});
