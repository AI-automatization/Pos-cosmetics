// WarehouseDashboardParts — reusable sub-components for WarehouseDashboardScreen
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { C } from './OmborColors';
import type { DashboardMovement } from '../../api/inventory.api';
import type { Alert } from '../../api/alerts.api';

// ── Constants ──────────────────────────────────────────────

const PURPLE = '#7C3AED';
const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];

export const MOVEMENT_CFG: Record<string, { color: string; labelKey: string }> = {
  IN:           { color: C.green,    labelKey: 'warehouse.movementIn' },
  OUT:          { color: C.red,      labelKey: 'warehouse.movementOut' },
  WRITE_OFF:    { color: C.orange,   labelKey: 'warehouse.movementWriteOff' },
  TRANSFER_IN:  { color: C.primary,  labelKey: 'warehouse.movementTransferIn' },
  TRANSFER_OUT: { color: PURPLE,     labelKey: 'warehouse.movementTransferOut' },
  ADJUSTMENT:   { color: C.secondary, labelKey: 'warehouse.movementAdjustment' },
  RETURN_IN:    { color: C.green,    labelKey: 'warehouse.movementReturnIn' },
};

// ── Helpers ────────────────────────────────────────────────

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatUzbekDate(): string {
  const d = new Date();
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function relativeTime(iso: string, t: TFunction): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return t('warehouse.justNow');
  if (mins < 60) return t('warehouse.minutesAgo', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('warehouse.hoursAgo', { count: hours });
  return formatDate(iso);
}

// ── StatCard ───────────────────────────────────────────────

interface StatCardProps {
  readonly title: string;
  readonly value: number;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly color: string;
  readonly subText?: string;
}

export function StatCard({ title, value, icon, color, subText }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconCircle, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subText ? <Text style={styles.statSub}>{subText}</Text> : null}
    </View>
  );
}

// ── QuickChip ──────────────────────────────────────────────

interface QuickChipProps {
  readonly label: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly onPress: () => void;
  readonly badge?: number;
}

export function QuickChip({ label, icon, onPress, badge }: QuickChipProps) {
  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.chipIconWrap}>
        <Ionicons name={icon} size={18} color={C.primary} />
        {badge !== undefined && badge > 0 && (
          <View style={styles.chipBadge}>
            <Text style={styles.chipBadgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.chipLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── MovementRow ────────────────────────────────────────────

const DEFAULT_MOVEMENT_CFG = { color: C.secondary, labelKey: 'warehouse.movementOther' } as const;

export function MovementRow({ item }: { readonly item: DashboardMovement }) {
  const { t } = useTranslation();
  const cfg = MOVEMENT_CFG[item.type] ?? DEFAULT_MOVEMENT_CFG;
  const isNegative = item.type === 'OUT' || item.type === 'TRANSFER_OUT' || item.type === 'WRITE_OFF';
  return (
    <View style={styles.movementRow}>
      <View style={[styles.movementBadge, { backgroundColor: cfg.color + '18' }]}>
        <Text style={[styles.movementBadgeText, { color: cfg.color }]}>{t(cfg.labelKey)}</Text>
      </View>
      <View style={styles.movementInfo}>
        <Text style={styles.movementName} numberOfLines={1}>{item.product.name}</Text>
        <Text style={styles.movementTime}>{formatTime(item.createdAt)}</Text>
      </View>
      <Text style={[styles.movementQty, { color: cfg.color }]}>
        {isNegative ? '-' : '+'}{item.quantity}
      </Text>
    </View>
  );
}

// ── RestockCard ────────────────────────────────────────────

interface RestockCardProps {
  readonly item: Alert;
  readonly onMarkRead: (id: string) => void;
  readonly isMarking: boolean;
}

export function RestockCard({ item, onMarkRead, isMarking }: RestockCardProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.restockCard}>
      <View style={styles.restockHeader}>
        <Ionicons name="arrow-up-circle" size={18} color={C.orange} />
        <Text style={styles.restockTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.restockTime}>{relativeTime(item.createdAt, t)}</Text>
      </View>
      <Text style={styles.restockBody} numberOfLines={2}>{item.message}</Text>
      <TouchableOpacity
        style={[styles.markReadBtn, isMarking && styles.markReadBtnDisabled]}
        onPress={() => onMarkRead(item.id)}
        disabled={isMarking}
        activeOpacity={0.7}
      >
        <Ionicons name="checkmark-circle-outline" size={14} color={C.white} />
        <Text style={styles.markReadBtnText}>{t('warehouse.markDone')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  // StatCard
  statCard: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 4,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: C.text },
  statTitle: { fontSize: 12, color: C.muted, fontWeight: '500' },
  statSub: { fontSize: 10, color: C.muted, marginTop: 2 },

  // QuickChip
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  chipIconWrap: { position: 'relative' },
  chipBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  chipBadgeText: { fontSize: 9, fontWeight: '700', color: C.white },
  chipLabel: { fontSize: 13, fontWeight: '600', color: C.text },

  // MovementRow
  movementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  movementBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  movementBadgeText: { fontSize: 11, fontWeight: '700' },
  movementInfo: { flex: 1 },
  movementName: { fontSize: 13, fontWeight: '600', color: C.text },
  movementTime: { fontSize: 10, color: C.muted, marginTop: 1 },
  movementQty: { fontSize: 14, fontWeight: '700' },

  // RestockCard
  restockCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 8,
    gap: 6,
  },
  restockHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  restockTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: C.text },
  restockTime: { fontSize: 10, color: C.muted },
  restockBody: { fontSize: 12, color: C.muted, lineHeight: 17 },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.green,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  markReadBtnDisabled: { opacity: 0.5 },
  markReadBtnText: { fontSize: 12, fontWeight: '700', color: C.white },
});
