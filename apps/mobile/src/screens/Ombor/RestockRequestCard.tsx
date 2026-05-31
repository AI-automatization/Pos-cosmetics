// RestockRequestCard — single restock request card with mark-read action
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Alert } from '../../api/alerts.api';
import { styles, RC } from './RestockRequestsScreen.styles';

/** Relative-time formatter for alert timestamps */
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Hozirgina';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return d.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

interface RestockRequestCardProps {
  readonly item: Alert;
  readonly onMarkRead: (id: string) => void;
  readonly isMarking: boolean;
}

function RestockRequestCard({
  item,
  onMarkRead,
  isMarking,
}: RestockRequestCardProps): React.JSX.Element {
  const productName = (item.metadata?.productName as string) ?? item.title;
  const currentStock = item.metadata?.currentStock as number | undefined;

  return (
    <View style={[styles.card, !item.isRead && styles.cardUnread]}>
      {!item.isRead && <View style={styles.unreadDot} />}

      <View style={styles.cardBody}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="arrow-up-circle" size={20} color={RC.orange} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {productName}
            </Text>
            <Text style={styles.cardTime}>{fmtDate(item.createdAt)}</Text>
          </View>
          {currentStock !== undefined && (
            <View style={styles.stockBadge}>
              <Text style={styles.stockBadgeText}>{currentStock}</Text>
              <Text style={styles.stockBadgeLabel}>dona</Text>
            </View>
          )}
        </View>

        {/* Message */}
        <Text style={styles.cardMessage} numberOfLines={2}>
          {item.message}
        </Text>

        {/* Branch */}
        {item.branchName && (
          <View style={styles.branchRow}>
            <Ionicons name="business-outline" size={12} color={RC.muted} />
            <Text style={styles.branchText}>{item.branchName}</Text>
          </View>
        )}

        {/* Action */}
        {!item.isRead && (
          <TouchableOpacity
            style={[styles.acceptBtn, isMarking && styles.acceptBtnDisabled]}
            onPress={() => onMarkRead(item.id)}
            disabled={isMarking}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
            <Text style={styles.acceptBtnText}>Qabul qildim</Text>
          </TouchableOpacity>
        )}

        {item.isRead && (
          <View style={styles.readBadge}>
            <Ionicons name="checkmark-done" size={14} color={RC.green} />
            <Text style={styles.readBadgeText}>Qabul qilingan</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default React.memo(RestockRequestCard);
