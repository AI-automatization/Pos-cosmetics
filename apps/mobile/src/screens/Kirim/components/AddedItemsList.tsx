// apps/mobile/src/screens/Kirim/components/AddedItemsList.tsx

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from './types';
import type { LineItem } from './types';
import { formatUZS } from '../../../utils/currency';

interface AddedItemsListProps {
  readonly items: LineItem[];
  readonly loading: boolean;
  readonly onRemove: (key: string) => void;
}

export default function AddedItemsList({ items, loading, onRemove }: AddedItemsListProps) {
  if (items.length === 0) {
    return null;
  }

  const total = items.reduce(
    (sum, i) => sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.costPrice) || 0),
    0,
  );

  return (
    <>
      <View style={styles.itemsList}>
        {items.map((item, idx) => {
          const qty  = parseFloat(item.quantity) || 0;
          const cost = parseFloat(item.costPrice) || 0;
          return (
            <View key={item.key} style={styles.addedItemRow}>
              <View style={styles.addedItemLeft}>
                <Text style={styles.addedItemIdx}>{idx + 1}</Text>
                <View style={styles.addedItemInfo}>
                  <Text style={styles.addedItemName} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text style={styles.addedItemDetail}>
                    {qty} dona × {formatUZS(cost)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => onRemove(item.key)}
                disabled={loading}
              >
                <Ionicons name="close-circle" size={20} color={C.red} />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Jami:</Text>
        <Text style={styles.totalValue}>{formatUZS(total)}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  itemsList: {
    marginTop: 8,
    gap: 6,
  },
  addedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: 'space-between',
  },
  addedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 10,
  },
  addedItemIdx: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.primary + '20',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: C.primary,
    lineHeight: 22,
  },
  addedItemInfo: {
    flex: 1,
  },
  addedItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
  },
  addedItemDetail: {
    fontSize: 11,
    color: C.secondary,
    marginTop: 2,
  },
  removeBtn: {
    padding: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.secondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: C.primary,
  },
});
