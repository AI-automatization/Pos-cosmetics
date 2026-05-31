import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './NewDebtSheet.styles';

interface ProductItem {
  product: { id: string; name: string; sellPrice: number };
  qty: number;
}

interface ProductsListProps {
  readonly items: ReadonlyArray<ProductItem>;
}

function ProductsList({ items }: ProductsListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.productsBox}>
      <Text style={styles.productsTitle}>Mahsulotlar</Text>
      {items.map((item) => (
        <View key={item.product.id} style={styles.productRow}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.product.name}
          </Text>
          <Text style={styles.productDetail}>
            {item.qty} x {item.product.sellPrice.toLocaleString('ru-RU')} ={' '}
            {(item.qty * item.product.sellPrice).toLocaleString('ru-RU')} UZS
          </Text>
        </View>
      ))}
    </View>
  );
}

export default React.memo(ProductsList);
