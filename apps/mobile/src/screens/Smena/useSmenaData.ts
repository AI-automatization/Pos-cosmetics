import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { useShiftStore } from '../../store/shiftStore';
import { useAuthStore } from '../../store/auth.store';
import { salesApi } from '../../api/sales.api';
import type { ShiftDetail } from '../../api/sales.api';
import type { ShiftRecord } from './SmenaComponents';

// ─── Utils ─────────────────────────────────────────────
function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '\u2014';
  return new Date(date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('uz-UZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function duration(openedAt: Date | string): string {
  const diffMs = Date.now() - new Date(openedAt).getTime();
  const totalMins = Math.floor(diffMs / 60_000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m} daqiqa`;
  return `${h} soat ${m} daqiqa`;
}

// ─── Error message extraction ──────────────────────────
function extractShiftError(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const resp = (err as {
      response?: {
        data?: { message?: string | string[]; error?: { message?: string } };
        status?: number;
      };
    }).response;
    const serverMsg = resp?.data?.error?.message ?? resp?.data?.message;
    if (serverMsg) {
      return Array.isArray(serverMsg) ? serverMsg.join('\n') : String(serverMsg);
    }
    if (resp?.status) {
      return `Xatolik ${resp.status}: ${fallback}`;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

// ─── Map API shift to ShiftRecord ──────────────────────
function mapToShiftRecord(
  s: ShiftDetail,
  fallbackCashier: string,
): ShiftRecord {
  return {
    id: s.id,
    cashier: s.user
      ? `${s.user.firstName} ${s.user.lastName}`
      : fallbackCashier,
    openedAt: formatTime(s.openedAt),
    closedAt: s.closedAt ? formatTime(s.closedAt) : null,
    openingCash: Number(s.openingCash ?? 0),
    closingCash: s.closingCash ?? null,
    totalRevenue: Number(s.totalRevenue ?? 0),
    totalOrders: s.totalOrders ?? 0,
    cashAmount: s.cashAmount ?? 0,
    cardAmount: s.cardAmount ?? 0,
    nasiyaAmount: s.nasiyaAmount ?? 0,
    expenses: s.expenses ?? 0,
  };
}

// ─── Hook ──────────────────────────────────────────────
export function useSmenaData() {
  const { isShiftOpen, shiftId, openShift, closeShift, syncWithApi } = useShiftStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [openSheetVisible, setOpenSheetVisible] = useState(false);
  const [closeSheetVisible, setCloseSheetVisible] = useState(false);

  const cashierName = user ? `${user.firstName} ${user.lastName}` : 'Kassir';

  // Sync with API on each screen focus
  useFocusEffect(
    useCallback(() => {
      void syncWithApi();
    }, [syncWithApi]),
  );

  // Current shift details
  const { data: shiftDetail, refetch: refetchDetail } = useQuery({
    queryKey: ['shift-detail', shiftId],
    queryFn: () => salesApi.getShiftById(shiftId!),
    enabled: !!shiftId && isShiftOpen,
    staleTime: 30_000,
  });

  // Shift history
  const { data: shiftsData } = useQuery({
    queryKey: ['shifts-history'],
    queryFn: () => salesApi.getShifts(1, 6),
    staleTime: 60_000,
  });

  // Map current shift
  const shift: ShiftRecord | null =
    isShiftOpen && shiftDetail
      ? mapToShiftRecord(shiftDetail, cashierName)
      : null;

  // Closed shifts history
  const historyShifts: ShiftRecord[] = (shiftsData?.items ?? [])
    .filter((s) => s.status?.toUpperCase() === 'CLOSED')
    .slice(0, 3)
    .map((s) => mapToShiftRecord(s, cashierName));

  // Handlers
  const handleToggleShift = () => {
    if (isShiftOpen) {
      setCloseSheetVisible(true);
    } else {
      setOpenSheetVisible(true);
    }
  };

  const handleOpenConfirm = (openingCash: number) => {
    setLoading(true);
    openShift(openingCash)
      .then(() => {
        setOpenSheetVisible(false);
      })
      .catch((err: unknown) => {
        let msg = extractShiftError(err, 'Smena ochishda xatolik yuz berdi');
        if (msg.includes('already has an open shift')) {
          msg = 'Sizda allaqachon ochiq smena mavjud';
          void syncWithApi();
        }
        Alert.alert('Xatolik', msg);
      })
      .finally(() => setLoading(false));
  };

  const handleCloseConfirm = async (actualCash: number) => {
    setLoading(true);
    try {
      await closeShift(actualCash);
      setCloseSheetVisible(false);
      void refetchDetail();
    } catch (err: unknown) {
      const msg = extractShiftError(err, 'Smena yopishda xatolik yuz berdi');
      Alert.alert('Xatolik', msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    isShiftOpen,
    loading,
    shift,
    shiftDetail,
    historyShifts,
    cashierName,
    openSheetVisible,
    closeSheetVisible,
    setOpenSheetVisible,
    setCloseSheetVisible,
    handleToggleShift,
    handleOpenConfirm,
    handleCloseConfirm,
  };
}
