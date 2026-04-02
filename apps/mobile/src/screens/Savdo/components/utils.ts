import type { CatalogProduct } from '../../../api/catalog.api';
import type { Product } from '../ProductCard';

export const C = {
  primary: '#5B5BD6',
  bg:      '#F5F5F7',
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  danger:  '#EF4444',
};

export const PLACEHOLDER_COLORS = [
  '#F5E6C8', '#F5D5E0', '#E8E8F5', '#D5E8F5',
  '#E8F5E8', '#FFF0E0', '#E0F0FF', '#F0FFE0',
];

export interface CartItem {
  product: Product;
  qty: number;
}

export function placeholderColor(id: string): string {
  return PLACEHOLDER_COLORS[id.charCodeAt(0) % PLACEHOLDER_COLORS.length] ?? '#E8E8F5';
}

export function toProduct(p: CatalogProduct): Product {
  return {
    id:               p.id,
    name:             p.name,
    sellPrice:        p.sellPrice,
    categoryId:       p.categoryId ?? 'uncategorized',
    stockQty:         p.stockQuantity ?? 0,
    minStockLevel:    p.minStockLevel ?? 5,
    placeholderColor: placeholderColor(p.id),
  };
}

export function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU') + ' UZS';
}
