import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StockTransferListItem, TransferStatus } from '../../api/inventory.api';
import { C } from './StockTransferColors';
import { s } from './TransferListView.styles';

// ─── Constants ───────────────────────────────────────────────────────────────

export type ActionType = 'approve' | 'ship' | 'receive' | 'cancel';

const MAX_VISIBLE_ITEMS = 3;

const STATUS_CFG: Record<TransferStatus, { bg: string; color: string; label: string }> = {
  REQUESTED: { bg: '#FEF3C7', color: '#92400E', label: "So'ralgan" },
  APPROVED:  { bg: '#DBEAFE', color: '#1E40AF', label: 'Tasdiqlangan' },
  SHIPPED:   { bg: '#EDE9FE', color: '#5B21B6', label: "Jo'natilgan" },
  RECEIVED:  { bg: '#DCFCE7', color: '#166534', label: 'Qabul qilingan' },
  CANCELLED: { bg: '#F3F4F6', color: '#6B7280', label: 'Bekor qilingan' },
};

interface ActionBtnConfig {
  label: string;
  color: string;
  action: ActionType;
}

function getActionButtons(status: TransferStatus): ActionBtnConfig[] {
  switch (status) {
    case 'REQUESTED':
      return [
        { label: 'Tasdiqlash', color: C.primary, action: 'approve' },
        { label: 'Bekor qilish', color: C.red, action: 'cancel' },
      ];
    case 'APPROVED':
      return [
        { label: "Jo'natish", color: C.primary, action: 'ship' },
        { label: 'Bekor qilish', color: C.red, action: 'cancel' },
      ];
    case 'SHIPPED':
      return [{ label: 'Qabul qilish', color: C.green, action: 'receive' }];
    default:
      return [];
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// ─── TransferCard ────────────────────────────────────────────────────────────

interface TransferCardProps {
  readonly item: StockTransferListItem;
  readonly actingId: string | null;
  readonly onAction: (id: string, action: ActionType) => void;
}

const TransferCard = React.memo(function TransferCard({
  item,
  actingId,
  onAction,
}: TransferCardProps) {
  const cfg = STATUS_CFG[item.status];
  const buttons = getActionButtons(item.status);
  const isActing = actingId === item.id;
  const visibleItems = item.items.slice(0, MAX_VISIBLE_ITEMS);
  const hiddenCount = item.items.length - MAX_VISIBLE_ITEMS;

  return (
    <View style={s.card}>
      {/* Card header */}
      <View style={s.cardHeader}>
        <View style={s.cardIdWrap}>
          <Ionicons name="swap-horizontal-outline" size={14} color={C.muted} />
          <Text style={s.cardId} numberOfLines={1}>
            #{item.id.slice(-8).toUpperCase()}
          </Text>
        </View>
        <View style={[s.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[s.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Branches */}
      <View style={s.branchRow}>
        <View style={s.branchBox}>
          <Text style={s.branchLabel}>Dan</Text>
          <Text style={s.branchName} numberOfLines={1}>
            {item.fromBranch.name}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={C.muted} style={s.arrowIcon} />
        <View style={[s.branchBox, s.branchBoxRight]}>
          <Text style={s.branchLabel}>Ga</Text>
          <Text style={s.branchName} numberOfLines={1}>
            {item.toBranch.name}
          </Text>
        </View>
      </View>

      {/* Items preview */}
      <View style={s.itemsWrap}>
        {visibleItems.map((it, idx) => (
          <View key={idx} style={s.itemRow}>
            <Text style={s.itemName} numberOfLines={1}>
              {it.product.name}
            </Text>
            <Text style={s.itemQty}>
              {it.quantity} dona
            </Text>
          </View>
        ))}
        {hiddenCount > 0 && (
          <Text style={s.moreItems}>+{hiddenCount} ta mahsulot</Text>
        )}
      </View>

      {/* Footer */}
      <View style={s.cardFooter}>
        <View style={s.footerLeft}>
          <Ionicons name="person-outline" size={12} color={C.muted} />
          <Text style={s.footerMeta} numberOfLines={1}>
            {item.requestedBy.firstName} {item.requestedBy.lastName}
          </Text>
          <Text style={s.footerDot}> · </Text>
          <Ionicons name="calendar-outline" size={12} color={C.muted} />
          <Text style={s.footerMeta}>{formatDate(item.createdAt)}</Text>
        </View>

        {buttons.length > 0 && (
          <View style={s.actionRow}>
            {isActing ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              buttons.map((btn) => (
                <TouchableOpacity
                  key={btn.action}
                  style={[s.actionBtn, { borderColor: btn.color }]}
                  onPress={() => onAction(item.id, btn.action)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.actionBtnText, { color: btn.color }]}>
                    {btn.label}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    </View>
  );
});

export default TransferCard;
