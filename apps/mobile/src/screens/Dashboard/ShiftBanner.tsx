import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Shift } from '@raos/types';
import { useShiftStore } from '../../store/shiftStore';
import SmenaOpenSheet from '../Smena/SmenaOpenSheet';
import SmenaCloseSheet from '../Smena/SmenaCloseSheet';
import ActiveShiftCard from './ActiveShiftCard';
import { styles } from './styles';

interface ShiftBannerProps {
  readonly shift: Shift | null;
  readonly onRefresh: () => void;
}

export default function ShiftBanner({ shift, onRefresh }: ShiftBannerProps) {
  const { openShift, closeShift, syncWithApi } = useShiftStore();
  const [loading, setLoading] = useState(false);
  const [openSheetVisible, setOpenSheetVisible] = useState(false);
  const [closeSheetVisible, setCloseSheetVisible] = useState(false);

  const handleOpenConfirm = useCallback((openingCash: number) => {
    setLoading(true);
    openShift(openingCash)
      .then(() => {
        setOpenSheetVisible(false);
        Alert.alert('Tayyor', 'Smena muvaffaqiyatli ochildi');
        onRefresh();
      })
      .catch((err: unknown) => {
        let msg = 'Smena ochishda xatolik';
        if (err && typeof err === 'object' && 'response' in err) {
          const resp = (err as { response?: { data?: { message?: string | string[]; error?: { message?: string } } } }).response;
          const serverMsg = resp?.data?.error?.message ?? resp?.data?.message;
          if (serverMsg) {
            msg = Array.isArray(serverMsg) ? serverMsg.join('\n') : String(serverMsg);
            if (msg.includes('already has an open shift')) {
              msg = 'Sizda allaqachon ochiq smena mavjud';
              void syncWithApi();
            }
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }
        Alert.alert('Xatolik', msg);
      })
      .finally(() => setLoading(false));
  }, [openShift, onRefresh, syncWithApi]);

  const handleCloseConfirm = useCallback(async (actualCash: number) => {
    setLoading(true);
    try {
      await closeShift(actualCash);
      setCloseSheetVisible(false);
      Alert.alert('Tayyor', 'Smena muvaffaqiyatli yopildi');
      onRefresh();
    } catch {
      Alert.alert('Xatolik', 'Smena yopishda xatolik');
    } finally {
      setLoading(false);
    }
  }, [closeShift, onRefresh]);

  return (
    <>
      {!shift ? (
        <View style={styles.smenaBanner}>
          <View style={styles.smenaBannerLeft}>
            <Ionicons name="time-outline" size={20} color="#D97706" />
            <Text style={styles.smenaBannerText}>Smena ochilmagan</Text>
          </View>
          <TouchableOpacity
            style={styles.smenaOpenBtn}
            activeOpacity={0.85}
            onPress={() => setOpenSheetVisible(true)}
          >
            <Text style={styles.smenaOpenBtnText}>Smena ochish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.section}
          onPress={() => setCloseSheetVisible(true)}
          activeOpacity={0.85}
        >
          <ActiveShiftCard shift={shift} />
        </TouchableOpacity>
      )}

      <SmenaOpenSheet
        visible={openSheetVisible}
        loading={loading}
        onClose={() => setOpenSheetVisible(false)}
        onConfirm={handleOpenConfirm}
      />
      <SmenaCloseSheet
        visible={closeSheetVisible}
        loading={loading}
        shift={shift}
        onClose={() => setCloseSheetVisible(false)}
        onConfirm={handleCloseConfirm}
      />
    </>
  );
}
