import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Promotion } from '@/api';
import { styles, C } from './ChegirmaScreen.styles';

// ─── Types ───────────────────────────────────────────────────────────────────

type DiscountType = 'PERCENT' | 'FIXED';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d: string): string => {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`;
};

const fmtValue = (type: DiscountType, rules: Record<string, unknown>, currency: string): string => {
  if (type === 'PERCENT') {
    return `${rules['percent'] as number}%`;
  }
  return `${Number(rules['amount']).toLocaleString('ru-RU')} ${currency}`;
};

// ─── Component ───────────────────────────────────────────────────────────────

interface DiscountCardProps {
  readonly item: Promotion;
}

const DiscountCard = React.memo(function DiscountCard({ item }: DiscountCardProps) {
  const { t } = useTranslation();
  const type = item.type as DiscountType;
  const badgeColor = type === 'PERCENT' ? C.primary : C.green;
  const badgeLabel = type === 'PERCENT' ? '%' : t('discounts.currency');
  const valueStr = fmtValue(type, item.rules, t('discounts.currency'));
  const dateFrom = fmtDate(item.validFrom);
  const dateTo = item.validTo ? fmtDate(item.validTo) : t('discounts.noExpiry');

  return (
    <View style={styles.card}>
      <View style={[styles.typeBadgeCircle, { backgroundColor: badgeColor + '1A' }]}>
        <Text style={[styles.typeBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusEnded]}>
            <Text style={[styles.statusText, item.isActive ? styles.statusActiveText : styles.statusEndedText]}>
              {item.isActive ? t('discounts.statusActive') : t('discounts.statusEnded')}
            </Text>
          </View>
        </View>
        <Text style={styles.cardValue}>{valueStr}</Text>
        <Text style={styles.cardDate}>{dateFrom} — {dateTo}</Text>
      </View>
    </View>
  );
});

export default DiscountCard;
