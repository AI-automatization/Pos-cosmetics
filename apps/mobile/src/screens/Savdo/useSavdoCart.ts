import { useState, useCallback } from 'react';
import type { CartItem } from './components/utils';

export default function useSavdoCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: CartItem['product']) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, closePayment: () => void) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.product.id !== productId);
      if (updated.length === 0) closePayment();
      return updated;
    });
  }, []);

  const decrementFromCart = useCallback((product: CartItem['product'], closePayment: () => void) => {
    setCart((prev) => {
      const item = prev.find((i) => i.product.id === product.id);
      if (!item) return prev;
      if (item.qty === 1) {
        const updated = prev.filter((i) => i.product.id !== product.id);
        if (updated.length === 0) closePayment();
        return updated;
      }
      return prev.map((i) =>
        i.product.id === product.id ? { ...i, qty: i.qty - 1 } : i,
      );
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartQty = useCallback(
    (productId: string) => cart.find((i) => i.product.id === productId)?.qty ?? 0,
    [cart],
  );

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.product.sellPrice * i.qty, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    decrementFromCart,
    clearCart,
    cartQty,
    totalItems,
    totalPrice,
  };
}
