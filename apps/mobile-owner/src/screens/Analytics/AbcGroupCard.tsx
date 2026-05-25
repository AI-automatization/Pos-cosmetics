import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AbcGroup, AbcProduct } from '../../api/analytics.api';
import { Colors } from '../../config/theme';
import { GROUP_COLORS, DEFAULT_GROUP_COLORS, fmt } from './abc-analysis.utils';
import { s } from './AbcAnalysisScreen.styles';

// ─── Product Row ──────────────────────────────────────────
function ProductRow({
  product,
  rank,
  barColor,
  maxRevenue,
}: {
  product: AbcProduct;
  rank: number;
  barColor: string;
  maxRevenue: number;
}) {
  const pct = maxRevenue > 0 ? (product.revenue / maxRevenue) * 100 : 0;
  return (
    <View style={s.productRow}>
      <Text style={s.productRank}>{rank}</Text>
      <View style={s.productMiddle}>
        <Text style={s.productName} numberOfLines={1}>
          {product.productName}
        </Text>
        <View style={s.productBarBg}>
          <View
            style={[
              s.productBarFill,
              { width: `${Math.max(pct, 2)}%`, backgroundColor: barColor },
            ]}
          />
        </View>
      </View>
      <View style={s.productRight}>
        <Text style={s.productRevenue}>{fmt(product.revenue)}</Text>
        <Text style={s.productPct}>{product.pct.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

// ─── Group Card ───────────────────────────────────────────
export default function AbcGroupCard({
  group,
  expanded,
  onToggle,
}: {
  group: AbcGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  const colors = GROUP_COLORS[group.group] ?? DEFAULT_GROUP_COLORS;
  return (
    <View style={s.groupCard}>
      <TouchableOpacity style={s.groupHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={[s.groupBadge, { backgroundColor: colors.bg }]}>
          <Text style={[s.groupLetter, { color: colors.text }]}>{group.group}</Text>
        </View>
        <View style={s.groupInfo}>
          <Text style={s.groupLabel}>{colors.label}</Text>
          <Text style={s.groupSub}>
            {group.products.length} mahsulot  •  {group.revenueShare.toFixed(0)}% ulush
          </Text>
        </View>
        <View style={s.groupRight}>
          <Text style={[s.groupRevenue, { color: colors.text }]}>{fmt(group.totalRevenue)}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* Revenue bar */}
      <View style={s.shareBarBg}>
        <View
          style={[
            s.shareBarFill,
            {
              width: `${Math.max(group.revenueShare, 1)}%`,
              backgroundColor: colors.bar,
            },
          ]}
        />
      </View>

      {/* Expanded product list */}
      {expanded && group.products.length > 0 && (
        <View style={s.productList}>
          {group.products.map((p, idx) => (
            <ProductRow
              key={p.productId}
              product={p}
              rank={idx + 1}
              barColor={colors.bar}
              maxRevenue={group.products[0]?.revenue ?? 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}
