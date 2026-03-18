'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, ShoppingCart } from 'lucide-react';
import {
  CUSTOMER_DISPLAY_CHANNEL,
  type CustomerDisplayMessage,
} from '@/hooks/pos/useCustomerDisplayBroadcast';
import { formatPrice, cn } from '@/lib/utils';
import type { CartItem } from '@/types/sales';

interface CartState {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
}

type Screen = 'idle' | 'cart' | 'sale-complete';

interface SaleInfo {
  orderNumber: string;
  total: number;
  change: number;
}

export default function CustomerDisplayPage() {
  const [screen, setScreen] = useState<Screen>('idle');
  const [cart, setCart] = useState<CartState>({
    items: [],
    subtotal: 0,
    discountAmount: 0,
    total: 0,
  });
  const [saleInfo, setSaleInfo] = useState<SaleInfo | null>(null);

  useEffect(() => {
    const ch = new BroadcastChannel(CUSTOMER_DISPLAY_CHANNEL);

    ch.onmessage = (event: MessageEvent<CustomerDisplayMessage>) => {
      const msg = event.data;

      if (msg.type === 'CART_UPDATE') {
        setSaleInfo(null);
        setCart({
          items: msg.items,
          subtotal: msg.subtotal,
          discountAmount: msg.discountAmount,
          total: msg.total,
        });
        setScreen('cart');
      } else if (msg.type === 'CART_CLEAR') {
        setSaleInfo(null);
        setCart({ items: [], subtotal: 0, discountAmount: 0, total: 0 });
        setScreen('idle');
      } else if (msg.type === 'SALE_COMPLETE') {
        setSaleInfo({ orderNumber: msg.orderNumber, total: msg.total, change: msg.change });
        setScreen('sale-complete');
        setTimeout(() => {
          setSaleInfo(null);
          setCart({ items: [], subtotal: 0, discountAmount: 0, total: 0 });
          setScreen('idle');
        }, 6000);
      }
    };

    return () => ch.close();
  }, []);

  if (screen === 'sale-complete' && saleInfo) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-emerald-950 text-white">
        <CheckCircle className="h-28 w-28 animate-bounce text-emerald-400" />
        <h1 className="text-5xl font-bold tracking-tight">Rahmat!</h1>
        <div className="mt-2 text-center">
          <p className="text-2xl text-emerald-300">{formatPrice(saleInfo.total)}</p>
          <p className="mt-1 text-lg text-emerald-500">
            Chek #{saleInfo.orderNumber}
          </p>
        </div>
        {saleInfo.change > 0 && (
          <div className="rounded-2xl border border-emerald-700 bg-emerald-900/60 px-8 py-4 text-center">
            <p className="text-sm text-emerald-400">Qaytim</p>
            <p className="text-3xl font-bold text-emerald-300">{formatPrice(saleInfo.change)}</p>
          </div>
        )}
      </div>
    );
  }

  if (screen === 'idle' || cart.items.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gray-950 text-white">
        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600/20">
          <ShoppingCart className="h-12 w-12 text-blue-400" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-white">Xush kelibsiz!</h1>
        <p className="text-xl text-gray-400">Do&apos;konimizga xush kelibsiz</p>
        <div className="mt-8 text-xs text-gray-700">RAOS POS · Mijoz ekrani</div>
      </div>
    );
  }

  const lastItem = cart.items[cart.items.length - 1];

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white">
      {/* Header */}
      <div className="shrink-0 bg-blue-700 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">Savat</h1>
          <span className="rounded-full bg-blue-500/50 px-3 py-1 text-sm">
            {cart.items.reduce((s, i) => s + i.quantity, 0)} ta mahsulot
          </span>
        </div>
      </div>

      {/* Last scanned item highlight */}
      {lastItem && (
        <div className="shrink-0 border-b border-blue-900/50 bg-blue-950/40 px-8 py-5">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-400">
            So&apos;nggi skanerlangan
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-white">{lastItem.name}</p>
              <p className="mt-0.5 text-gray-400">
                {lastItem.quantity} × {formatPrice(lastItem.sellPrice)}
                {lastItem.lineDiscount > 0 && (
                  <span className="ml-2 text-green-400">−{lastItem.lineDiscount}%</span>
                )}
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-300">
              {formatPrice(
                lastItem.sellPrice * lastItem.quantity * (1 - lastItem.lineDiscount / 100),
              )}
            </p>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="flex-1 overflow-auto px-8 py-4">
        <div className="flex flex-col divide-y divide-gray-800">
          {[...cart.items].reverse().map((item, idx) => {
            const lineTotal = item.sellPrice * item.quantity * (1 - item.lineDiscount / 100);
            const isLast = idx === 0;
            return (
              <div
                key={item.productId}
                className={cn(
                  'flex items-center justify-between py-3 transition-all',
                  isLast && 'opacity-50',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-xs font-mono text-gray-400">
                    {item.quantity}
                  </span>
                  <div>
                    <p className="text-base font-medium text-gray-200">{item.name}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.sellPrice)} / dona</p>
                  </div>
                </div>
                <p className="text-base font-semibold text-gray-200">{formatPrice(lineTotal)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total bar */}
      <div className="shrink-0 bg-gray-900 px-8 py-5">
        {cart.discountAmount > 0 && (
          <div className="mb-2 flex items-center justify-between text-base text-green-400">
            <span>Chegirma</span>
            <span>− {formatPrice(cart.discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-300">JAMI TO&apos;LOV</span>
          <span className="text-4xl font-extrabold tracking-tight text-blue-400">
            {formatPrice(cart.total)}
          </span>
        </div>
      </div>
    </div>
  );
}
