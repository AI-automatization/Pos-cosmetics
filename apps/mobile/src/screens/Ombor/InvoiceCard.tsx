import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import type { InvoiceListItem } from '../../api/inventory.api';
import { styles } from './InvoicesScreen.styles';

// ─── Constants ───────────────────────────────────────────
const MONO = Platform.select({ ios: 'Courier New', android: 'monospace' });

type InvoiceStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

const STATUS_CFG: Record<InvoiceStatus, { bg: string; color: string; label: string }> = {
  PENDING:   { bg: '#FEF3C7', color: '#D97706', label: 'Kutilmoqda' },
  RECEIVED:  { bg: '#DCFCE7', color: '#16A34A', label: 'Qabul qilindi' },
  CANCELLED: { bg: '#F3F4F6', color: '#6B7280', label: 'Bekor' },
};

// ─── Helpers ─────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('uz-UZ') + " so'm";
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── InvoiceCard ─────────────────────────────────────────
interface InvoiceCardProps {
  readonly item: InvoiceListItem;
  readonly onPress: (id: string) => void;
}

const InvoiceCard = React.memo(function InvoiceCard({
  item,
  onPress,
}: InvoiceCardProps) {
  const statusKey =
    item.status in STATUS_CFG
      ? (item.status as InvoiceStatus)
      : 'PENDING';
  const cfg = STATUS_CFG[statusKey];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item.id)}
      activeOpacity={0.8}
    >
      {/* Row 1: invoice number + status badge */}
      <View style={styles.cardRowBetween}>
        <Text style={[styles.invoiceNumber, { fontFamily: MONO }]}>
          #{item.invoiceNumber ?? 'N/A'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
      </View>

      {/* Row 2: supplier + items count */}
      <View style={styles.cardRowGap}>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {item.supplier?.name ?? "Yetkazib beruvchi yo'q"}
        </Text>
        <Text style={styles.cardMeta}>{item.itemsCount} mahsulot</Text>
      </View>

      {/* Row 3: date + total */}
      <View style={styles.cardRowBetween}>
        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        <Text style={styles.cardTotal}>{fmt(item.totalCost)}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default InvoiceCard;
