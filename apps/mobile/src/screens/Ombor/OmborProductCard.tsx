// Ombor screen — ProductCard component
import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { LowStockItem } from '../../api/inventory.api';
import { C } from './OmborColors';
import { getStatus, STATUS_CFG } from './OmborTypes';

const MONO = Platform.select({ ios: 'Courier New', android: 'monospace' });

interface ProductCardProps {
  readonly item: LowStockItem;
  readonly onPress?: () => void;
  readonly onPrint?: () => void;
}

export default function OmborProductCard({ item, onPress, onPrint }: ProductCardProps) {
  const status = getStatus(item);
  const cfg    = STATUS_CFG[status];
  const queryClient = useQueryClient();

  const restockMutation = useMutation({
    mutationFn: () => inventoryApi.sendRestockRequest({
      productId: item.productId,
      productName: item.productName,
      currentStock: item.stock ?? item.quantity ?? 0,
    }),
    onSuccess: (data) => {
      Alert.alert('Yuborildi', `${data?.notifiedCount ?? 0} ta xodimga xabar yuborildi`);
      queryClient.invalidateQueries({ queryKey: ['restock-requests'] });
    },
    onError: () => {
      Alert.alert('Xatolik', 'So\'rov yuborilmadi. Qayta urinib ko\'ring.');
    },
  });

  const initials = item.productName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const handleRequest = useCallback(() => {
    Alert.alert(
      'Kirim so\'rash',
      `"${item.productName}" uchun kirim so'rovi yuborilsinmi?`,
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: 'Yuborish',
          onPress: () => restockMutation.mutate(),
        },
      ],
    );
  }, [item.productName, restockMutation]);

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: cfg.stockColor }]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      {/* Product image / initials */}
      <View style={[styles.imageBox, { backgroundColor: cfg.iconBg }]}>
        <Text style={[styles.initials, { color: cfg.iconColor }]}>{initials}</Text>
      </View>

      {/* Middle: name + SKU + warehouse */}
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>{item.productName}</Text>
        {item.sku ? (
          <Text style={styles.sku}>{item.sku}</Text>
        ) : null}
        <View style={styles.warehouseRow}>
          <Ionicons name="location-outline" size={11} color={C.muted} />
          <Text style={styles.warehouseText} numberOfLines={1}>{item.warehouseName}</Text>
        </View>
      </View>

      {/* Right: stock + badge + button */}
      <View style={styles.right}>
        <View style={styles.stockWrap}>
          <Text style={[styles.stockValue, { color: cfg.stockColor }]}>
            {item.stock} ta
          </Text>
          <Text style={styles.minStock}>min {item.minStockLevel}</Text>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: cfg.badgeBg }]}>
            <Text style={[styles.badgeText, { color: cfg.badgeText }]}>{cfg.label}</Text>
          </View>

          {onPrint && (
            <TouchableOpacity style={styles.printIconBtn} onPress={onPrint} activeOpacity={0.7}>
              <Ionicons name="print-outline" size={16} color={C.primary} />
            </TouchableOpacity>
          )}
        </View>

        {status !== 'MAVJUD' && (
          <TouchableOpacity
            style={[styles.requestBtn, restockMutation.isPending && styles.requestBtnDisabled]}
            onPress={handleRequest}
            activeOpacity={0.75}
            disabled={restockMutation.isPending}
          >
            {restockMutation.isPending ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Text style={styles.requestBtnText}>Kirim so'rash</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 4,
  },
  imageBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 16,
    fontWeight: '800',
  },
  middle: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  sku: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: MONO,
  },
  warehouseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  warehouseText: {
    fontSize: 11,
    color: C.muted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 5,
  },
  stockWrap: {
    alignItems: 'flex-end',
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  minStock: {
    fontSize: 11,
    color: C.muted,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  printIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  requestBtn: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  requestBtnDisabled: {
    opacity: 0.5,
  },
  requestBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
});
