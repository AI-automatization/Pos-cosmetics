// WarehouseDashboardSections — extracted section components for WarehouseDashboardScreen
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { C } from './OmborColors';
import { MovementRow, RestockCard, formatDate } from './WarehouseDashboardParts';
import type { DashboardLowStockItem, DashboardExpiryItem, DashboardMovement } from '../../api/inventory.api';
import type { Alert } from '../../api/alerts.api';
import { styles } from './WarehouseDashboardScreen.styles';

// ── AlertBanner ──────────────────────────────────────────────

interface AlertBannerProps {
  readonly expiredCount: number;
}

export function AlertBanner({ expiredCount }: AlertBannerProps) {
  const { t } = useTranslation();
  if (expiredCount <= 0) return null;
  return (
    <View style={styles.alertBanner}>
      <Ionicons name="warning-outline" size={20} color={C.red} />
      <Text style={styles.alertBannerText}>
        {t('warehouse.expiredAlert', { count: expiredCount })}
      </Text>
    </View>
  );
}

// ── LowStockSection ─────────────────────────────────────────

interface LowStockSectionProps {
  readonly items: readonly DashboardLowStockItem[];
  readonly maxItems: number;
  readonly onSeeAll: () => void;
}

export function LowStockSection({ items, maxItems, onSeeAll }: LowStockSectionProps) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('warehouse.lowStock')}</Text>
        <View style={styles.countBadgeRed}>
          <Text style={styles.countBadgeRedText}>{items.length}</Text>
        </View>
      </View>
      {items.slice(0, maxItems).map((item) => (
        <View key={item.productId} style={styles.lowStockRow}>
          <Text style={styles.lowStockName} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.lowStockQty, { color: item.totalQty <= 0 ? C.red : C.orange }]}>
            {item.totalQty} {t('warehouse.unit')}
          </Text>
        </View>
      ))}
      {items.length > maxItems && (
        <TouchableOpacity style={styles.seeAllBtn} onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>{t('warehouse.seeAll')}</Text>
          <Ionicons name="chevron-forward" size={14} color={C.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── MovementsSection ────────────────────────────────────────

interface MovementsSectionProps {
  readonly items: readonly DashboardMovement[];
  readonly maxItems: number;
}

export function MovementsSection({ items, maxItems }: MovementsSectionProps) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('warehouse.todayMovementsSection')}</Text>
      {items.slice(0, maxItems).map((mov) => (
        <MovementRow key={mov.id} item={mov} />
      ))}
    </View>
  );
}

// ── RestockSection ──────────────────────────────────────────

interface RestockSectionProps {
  readonly items: readonly Alert[];
  readonly onMarkRead: (id: string) => void;
  readonly markingId: string | undefined;
  readonly isMarking: boolean;
}

export function RestockSection({ items, onMarkRead, markingId, isMarking }: RestockSectionProps) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('warehouse.restockRequests')}</Text>
        <View style={styles.countBadgeBlue}>
          <Text style={styles.countBadgeBlueText}>{items.length}</Text>
        </View>
      </View>
      {items.map((item) => (
        <RestockCard
          key={item.id}
          item={item}
          onMarkRead={(id) => onMarkRead(id)}
          isMarking={isMarking && markingId === item.id}
        />
      ))}
    </View>
  );
}

// ── ExpirySection ───────────────────────────────────────────

interface ExpirySectionProps {
  readonly items: readonly DashboardExpiryItem[];
}

export function ExpirySection({ items }: ExpirySectionProps) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('warehouse.expiringSoonSection')}</Text>
      {items.map((item) => (
        <View key={`${item.productId}-${item.batchNumber ?? item.expiryDate}`} style={styles.expiryCard}>
          <View style={styles.expiryLeftBorder} />
          <View style={styles.expiryContent}>
            <Text style={styles.expiryName} numberOfLines={1}>{item.product.name}</Text>
            <View style={styles.expiryMeta}>
              <Text style={styles.expiryDateText}>{formatDate(item.expiryDate)}</Text>
              {item.batchNumber ? (
                <Text style={styles.expiryBatch}>{t('warehouse.batch', { number: item.batchNumber })}</Text>
              ) : null}
            </View>
          </View>
          <Text style={styles.expiryQty}>{item.quantity} {t('warehouse.unit')}</Text>
        </View>
      ))}
    </View>
  );
}
