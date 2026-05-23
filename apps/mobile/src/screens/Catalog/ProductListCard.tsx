import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CatalogProduct } from '../../api/catalog.api';
import { styles, C, STOCK_STYLE, type StockStatus } from './ProductsScreen.styles';

// ─── Helpers ───────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString('ru-RU'); }

function stockStatus(qty: number, min: number): StockStatus {
  if (qty === 0) return 'TUGAGAN';
  if (qty <= min) return 'KAM';
  return 'OK';
}

// ─── Props ─────────────────────────────────────────────
interface ProductListCardProps {
  readonly product: CatalogProduct;
  readonly onEdit: (p: CatalogProduct) => void;
  readonly onDelete: (p: CatalogProduct) => void;
  readonly onPrint: (p: CatalogProduct) => void;
  readonly canEdit: boolean;
}

// ─── Component ─────────────────────────────────────────
export function ProductListCard({
  product,
  onEdit,
  onDelete,
  onPrint,
  canEdit,
}: ProductListCardProps) {
  const status = stockStatus(product.stockQuantity, product.minStockLevel);
  const stock = STOCK_STYLE[status];
  const initials = product.name.slice(0, 2).toUpperCase();
  const margin = product.costPrice > 0
    ? Math.round(((product.sellPrice - product.costPrice) / product.costPrice) * 100)
    : 0;

  const handleMenu = () => {
    const actions: Parameters<typeof Alert.alert>[2] = [];
    if (canEdit) {
      actions.push({ text: 'Tahrirlash', onPress: () => onEdit(product) });
    }
    actions.push({ text: 'Etiketka chop', onPress: () => onPrint(product) });
    actions.push({ text: "O'chirish", style: 'destructive', onPress: () => onDelete(product) });
    actions.push({ text: 'Bekor qilish', style: 'cancel' });
    Alert.alert(product.name, undefined, actions);
  };

  return (
    <View style={styles.card}>
      {/* Image placeholder */}
      <View style={[styles.imgBox, styles.imgBoxBlue]}>
        <Text style={styles.imgInitials}>{initials}</Text>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.productSku}>
          {product.sku}
          {product.categoryName ? `  ·  ${product.categoryName}` : ''}
        </Text>
        <View style={styles.cardBottom}>
          <Text style={styles.productPrice}>{fmt(product.sellPrice)} UZS</Text>
          <View style={[styles.stockBadge, { backgroundColor: stock.bg }]}>
            <Text style={[styles.stockText, { color: stock.text }]}>{status}</Text>
          </View>
          {margin > 0 && (
            <View style={styles.marginBadge}>
              <Text style={styles.marginText}>+{margin}%</Text>
            </View>
          )}
        </View>
      </View>

      {/* Menu button */}
      <TouchableOpacity style={styles.menuBtn} onPress={handleMenu} activeOpacity={0.7}>
        <Ionicons name="ellipsis-vertical" size={18} color={C.muted} />
      </TouchableOpacity>
    </View>
  );
}
