import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, formatPrice } from './utils';

interface CartBarProps {
  readonly totalItems: number;
  readonly totalPrice: number;
  readonly isShiftOpen: boolean;
  readonly orderLoading: boolean;
  readonly onPress: () => void;
}

export default function CartBar({
  totalItems,
  totalPrice,
  isShiftOpen,
  orderLoading,
  onPress,
}: CartBarProps) {
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [slideAnim]);

  return (
    <Animated.View style={[styles.cartBar, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.cartIconWrap}>
        <Ionicons name="cart-outline" size={24} color={C.primary} />
        <View style={styles.cartCount}>
          <Text style={styles.cartCountText}>{totalItems}</Text>
        </View>
      </View>

      <View style={styles.cartInfo}>
        <Text style={styles.cartLabel}>Umumiy hisob</Text>
        <Text style={styles.cartTotal}>{formatPrice(totalPrice)}</Text>
      </View>

      {isShiftOpen ? (
        <TouchableOpacity
          style={[styles.payButton, orderLoading && styles.payButtonDisabled]}
          activeOpacity={0.85}
          onPress={onPress}
          disabled={orderLoading}
        >
          {orderLoading ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <Text style={styles.payButtonText}>To'lash →</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.payButton, styles.payButtonDisabled]}
          disabled
          activeOpacity={1}
        >
          <Text style={styles.payButtonText}>Smena oching</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cartBar: {
    position:            'absolute',
    bottom:              0,
    left:                0,
    right:               0,
    flexDirection:       'row',
    alignItems:          'center',
    backgroundColor:     C.white,
    paddingHorizontal:   16,
    paddingVertical:     12,
    paddingBottom:       20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor:         '#000',
    shadowOffset:        { width: 0, height: -4 },
    shadowOpacity:       0.08,
    shadowRadius:        12,
    elevation:           10,
    gap:                 12,
  },
  cartIconWrap: {
    position: 'relative',
  },
  cartCount: {
    position:        'absolute',
    top:             -6,
    right:           -6,
    width:           18,
    height:          18,
    borderRadius:    9,
    backgroundColor: C.danger,
    alignItems:      'center',
    justifyContent:  'center',
  },
  cartCountText: {
    color:      C.white,
    fontSize:   10,
    fontWeight: '700',
  },
  cartInfo: {
    flex: 1,
  },
  cartLabel: {
    fontSize:   11,
    color:      C.muted,
    fontWeight: '500',
  },
  cartTotal: {
    fontSize:   15,
    fontWeight: '800',
    color:      C.text,
  },
  payButton: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical:   12,
    borderRadius:      12,
    minWidth:          100,
    alignItems:        'center',
    justifyContent:    'center',
  },
  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    color:      C.white,
    fontSize:   15,
    fontWeight: '700',
  },
});
