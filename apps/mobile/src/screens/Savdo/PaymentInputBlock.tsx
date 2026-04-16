import React from 'react';
import { View, Text, TextInput, Switch, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fmt, type PaymentMethod } from './PaymentSheetTypes';

// ─── Props ─────────────────────────────────────────────
interface Props {
  readonly split: boolean;
  readonly method: PaymentMethod;
  readonly received: string;
  readonly splitCard: string;
  readonly total: number;
  readonly change: number;
  readonly receivedNum: number;
  readonly onReceivedChange: (v: string) => void;
  readonly onSplitCardChange: (v: string) => void;
  readonly onSplitToggle: (v: boolean) => void;
}

// ─── Component ─────────────────────────────────────────
export default function PaymentInputBlock({
  split,
  method,
  received,
  splitCard,
  total,
  change,
  receivedNum,
  onReceivedChange,
  onSplitCardChange,
  onSplitToggle,
}: Props) {
  const splitCardNum = parseFloat(splitCard.replace(/\s/g, '')) || 0;

  return (
    <>
      {/* Split toggle */}
      <View style={styles.splitRow}>
        <View style={styles.splitLeft}>
          <MaterialCommunityIcons name="shuffle-variant" size={18} color="#6B7280" />
          <Text style={styles.splitLabel}>Aralash to'lov</Text>
        </View>
        <Switch
          value={split}
          onValueChange={onSplitToggle}
          trackColor={{ false: '#E5E7EB', true: '#5B5BD6' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Naqd input — only cash, no split */}
      {method === 'NAQD' && !split && (
        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>Qabul qilindi</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputField}
              value={received}
              onChangeText={onReceivedChange}
              keyboardType="numeric"
              textAlign="right"
            />
            <Text style={styles.inputSuffix}>UZS</Text>
          </View>
          <View style={styles.changeRow}>
            <Text style={styles.changeLabel}>Qaytim:</Text>
            <Text style={[styles.changeAmount, change < 0 && styles.changeNeg]}>
              {fmt(Math.abs(change))}
            </Text>
          </View>
        </View>
      )}

      {/* Split: naqd + karta */}
      {split && (
        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>Naqd</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputField}
              value={received}
              onChangeText={onReceivedChange}
              keyboardType="numeric"
              textAlign="right"
            />
            <Text style={styles.inputSuffix}>UZS</Text>
          </View>
          <Text style={[styles.inputLabel, styles.inputLabelSpaced]}>Karta</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputField}
              value={splitCard}
              onChangeText={onSplitCardChange}
              keyboardType="numeric"
              textAlign="right"
              placeholder={fmt(total - receivedNum)}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.inputSuffix}>UZS</Text>
          </View>
          <View style={styles.changeRow}>
            <Text style={styles.changeLabel}>Jami:</Text>
            <Text
              style={[
                styles.changeAmount,
                receivedNum + splitCardNum < total && styles.changeNeg,
              ]}
            >
              {fmt(receivedNum + splitCardNum)}
            </Text>
          </View>
        </View>
      )}
    </>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 8,
  },
  splitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  splitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputBlock: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  inputLabelSpaced: {
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputField: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  changeLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  changeAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5B5BD6',
  },
  changeNeg: {
    color: '#EF4444',
  },
});
