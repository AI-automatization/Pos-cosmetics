# Mobile App — 7 Bug & Feature Fixes

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 7 ta bug va feature ni mobile app da tuzatish/qo'shish.

**Architecture:** Barcha o'zgarishlar `apps/mobile/src/screens/` ichida. Yangi komponent yaratilmaydi — mavjud fayllar o'zgartiriladi. Holat boshqaruvi: Zustand (shift) + lokal useState (modal ko'rinishi).

**Tech Stack:** React Native + Expo, Zustand, TypeScript, @react-navigation/native

---

## Chunk 1: Shift Guard Bug Fix

### Task 1: SmenaScreen → ShiftStore sync

**Root cause:** `SmenaScreen` `useState(true)` ishlatadi — shift lokal holat. `Savdo` esa `useShiftStore().isShiftOpen` ni o'qiydi — Zustand holat. Ikkalasi bog'liq emas, shuning uchun smena ochiq ko'rinsa ham Savdo da "Smena oching" ko'rinadi.

**Files:**
- Modify: `apps/mobile/src/screens/Smena/index.tsx`

- [ ] **Step 1: SmenaScreen da shiftStore import qil va isActive ni store bilan sinxronla**

`apps/mobile/src/screens/Smena/index.tsx` faylining boshiga qo'sh:
```tsx
import { useShiftStore } from '../../store/shiftStore';
```

`SmenaScreen` ichida:
```tsx
// Eski:
const [isActive, setIsActive] = useState(true);

// Yangi:
const { isShiftOpen, openShift, closeShift } = useShiftStore();
const [isActive, setIsActive] = useState(isShiftOpen);
```

- [ ] **Step 2: handleToggleShift ichida openShift/closeShift chaqir**

```tsx
const handleToggleShift = () => {
  if (isActive) {
    Alert.alert(
      'Smenani yopish',
      'Joriy smenani yopmoqchimisiz?',
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: 'Yopish',
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setIsActive(false);
              closeShift();        // ← QO'SHILDI
            }, 800);
          },
        },
      ],
    );
  } else {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsActive(true);
      openShift();                 // ← QO'SHILDI
    }, 800);
  }
};
```

- [ ] **Step 3: Tekshir — Smena da "Smena ochish" bosganda Savdo screen da "To'lov →" tugmasi ko'rinadi**

- [ ] **Step 4: Commit**
```bash
git add apps/mobile/src/screens/Smena/index.tsx
git commit -m "fix(mobile): sync SmenaScreen shift state with shiftStore"
```

---

## Chunk 2: Cart Item Remove in ProductCard

### Task 2: ProductCard da "-" tugmasi qo'sh

**Muammo:** `removeFromCart` mavjud, `PaymentSheet` da ham X tugma bor — lekin asosiy mahsulot gridida mahsulot qo'shgandan keyin uni kamaytirish/o'chirish imkoni yo'q.

**Files:**
- Modify: `apps/mobile/src/screens/Savdo/ProductCard.tsx`
- Modify: `apps/mobile/src/screens/Savdo/index.tsx`

- [ ] **Step 1: ProductCard ga onDecrement prop qo'sh**

`ProductCard.tsx` da `Props` interfeysi:
```tsx
interface Props {
  product: Product;
  cartQty: number;
  onPress: (product: Product) => void;
  onDecrement?: (product: Product) => void;  // ← QO'SHILDI
}
```

- [ ] **Step 2: cartQty > 0 bo'lganda "-/+" satrini ko'rsat**

`ProductCard` export default funksiya ichida, `cartBadge` ni o'rniga:
```tsx
{cartQty > 0 && (
  <View style={styles.cartControls}>
    <TouchableOpacity
      style={styles.controlBtn}
      onPress={(e) => { e.stopPropagation(); onDecrement?.(product); }}
      activeOpacity={0.7}
    >
      <Text style={styles.controlBtnText}>−</Text>
    </TouchableOpacity>
    <Text style={styles.controlQty}>{cartQty}</Text>
    <TouchableOpacity
      style={[styles.controlBtn, styles.controlBtnAdd]}
      onPress={(e) => { e.stopPropagation(); onPress(product); }}
      activeOpacity={0.7}
    >
      <Text style={[styles.controlBtnText, { color: '#FFFFFF' }]}>+</Text>
    </TouchableOpacity>
  </View>
)}
```

- [ ] **Step 3: Yangi stillar qo'sh**

`styles` ga qo'sh:
```tsx
cartControls: {
  position: 'absolute',
  bottom: 8,
  right: 6,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
},
controlBtn: {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: '#F3F4F6',
  alignItems: 'center',
  justifyContent: 'center',
},
controlBtnAdd: {
  backgroundColor: '#5B5BD6',
},
controlBtnText: {
  fontSize: 14,
  fontWeight: '700',
  color: '#374151',
  lineHeight: 16,
},
controlQty: {
  fontSize: 13,
  fontWeight: '700',
  color: '#111827',
  minWidth: 16,
  textAlign: 'center',
},
```

- [ ] **Step 4: Savdo/index.tsx da decrementFromCart qo'sh va ProductCard ga uzat**

`Savdo/index.tsx` da `removeFromCart` dan keyin:
```tsx
const decrementFromCart = (product: Product) => {
  setCart((prev) => {
    const item = prev.find((i) => i.product.id === product.id);
    if (!item) return prev;
    if (item.qty === 1) {
      const updated = prev.filter((i) => i.product.id !== product.id);
      if (updated.length === 0) setPaymentVisible(false);
      return updated;
    }
    return prev.map((i) =>
      i.product.id === product.id ? { ...i, qty: i.qty - 1 } : i,
    );
  });
};
```

`renderItem` da:
```tsx
<ProductCard
  product={item}
  cartQty={cartQty(item.id)}
  onPress={addToCart}
  onDecrement={decrementFromCart}   // ← QO'SHILDI
/>
```

- [ ] **Step 5: Tekshir — mahsulot qo'shganda "-/+" tugmalari chiqadi, "-" bosib miqdorni kamaytirish mumkin**

- [ ] **Step 6: Commit**
```bash
git add apps/mobile/src/screens/Savdo/ProductCard.tsx apps/mobile/src/screens/Savdo/index.tsx
git commit -m "feat(mobile): add decrement button to ProductCard in Savdo"
```

---

## Chunk 3: Auto-open NewDebtSheet from Savdo

### Task 3: NasiyaScreen route params o'qi va NewDebtSheet avtomatik och

**Muammo:** `PaymentSheet` NASIYA tanlanganda `navigation.navigate('Nasiya', { openNewDebt: true, amount, products })` chaqiradi — lekin `NasiyaScreen` route params ni hech qachon o'qimaydi.

**Files:**
- Modify: `apps/mobile/src/screens/Nasiya/index.tsx`
- Modify: `apps/mobile/src/screens/Nasiya/NewDebtSheet.tsx`

- [ ] **Step 1: NasiyaScreen da useRoute import qil**

`Nasiya/index.tsx` boshiga qo'sh:
```tsx
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { TabParamList } from '../../navigation/types';
```

- [ ] **Step 2: Route params ni o'qi va useEffect bilan sheet och**

`NasiyaScreen` ichida, mavjud state lardan keyin:
```tsx
const route = useRoute<RouteProp<TabParamList, 'Nasiya'>>();

// Route params dan auto-open
React.useEffect(() => {
  const params = route.params;
  if (params?.openNewDebt) {
    setNewDebtVisible(true);
  }
}, [route.params]);
```

- [ ] **Step 3: NewDebtSheet ga initialAmount va initialProducts props qo'sh**

`Nasiya/NewDebtSheet.tsx` da:
```tsx
interface ProductItem {
  product: { id: string; name: string; sellPrice: number };
  qty: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialAmount?: number;      // ← QO'SHILDI
  initialProducts?: ProductItem[];  // ← QO'SHILDI
}
```

`NewDebtSheet` funksiya parametrlari:
```tsx
export default function NewDebtSheet({
  visible, onClose, onSuccess,
  initialAmount, initialProducts,
}: Props) {
```

- [ ] **Step 4: initialAmount bilan formni pre-fill qil**

`NewDebtSheet` ichida, mavjud `useState` dan keyin:
```tsx
// initialAmount kelganda totalAmount ni pre-fill qil
React.useEffect(() => {
  if (visible && initialAmount !== undefined && initialAmount > 0) {
    setForm((prev) => ({ ...prev, totalAmount: String(initialAmount) }));
  }
}, [visible, initialAmount]);

// Sheet yopilganda formni reset qil
React.useEffect(() => {
  if (!visible) {
    setForm(EMPTY_FORM);
  }
}, [visible]);
```

- [ ] **Step 5: initialProducts ko'rsat (faqat o'qish uchun)**

`NewDebtSheet` JSX da, "Mijoz ismi" text dan avval:
```tsx
{initialProducts && initialProducts.length > 0 && (
  <View style={styles.productsBox}>
    <Text style={styles.productsTitle}>Mahsulotlar</Text>
    {initialProducts.map((item) => (
      <View key={item.product.id} style={styles.productRow}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={styles.productDetail}>
          {item.qty} × {item.product.sellPrice.toLocaleString('ru-RU')} ={' '}
          {(item.qty * item.product.sellPrice).toLocaleString('ru-RU')} UZS
        </Text>
      </View>
    ))}
  </View>
)}
```

Stillar:
```tsx
productsBox: {
  backgroundColor: '#F9FAFB',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  padding: 12,
  marginBottom: 12,
},
productsTitle: {
  fontSize: 13,
  fontWeight: '700',
  color: '#374151',
  marginBottom: 8,
},
productRow: {
  paddingVertical: 4,
  borderTopWidth: 1,
  borderTopColor: '#F3F4F6',
},
productName: {
  fontSize: 13,
  fontWeight: '600',
  color: '#111827',
},
productDetail: {
  fontSize: 12,
  color: '#9CA3AF',
  marginTop: 2,
},
```

- [ ] **Step 6: NasiyaScreen da NewDebtSheet ga props uzat**

```tsx
<NewDebtSheet
  visible={newDebtVisible}
  onClose={() => setNewDebtVisible(false)}
  onSuccess={() => { setNewDebtVisible(false); refetchAll(); }}
  initialAmount={route.params?.amount}
  initialProducts={route.params?.products}
/>
```

- [ ] **Step 7: Tekshir — Savdo da NASIYA to'lov tanlasa, Nasiya screen ochilganda NewDebtSheet avtomatik ko'rinadi, summa to'ldirilgan, mahsulotlar ko'rinib turibdi**

- [ ] **Step 8: Commit**
```bash
git add apps/mobile/src/screens/Nasiya/index.tsx apps/mobile/src/screens/Nasiya/NewDebtSheet.tsx
git commit -m "feat(mobile): auto-open NewDebtSheet with prefilled data from Savdo NASIYA payment"
```

---

## Chunk 4: Debt Detail Modal + Remove FAB

### Task 4: DebtCard ustiga bosganda detail modal och

**Muammo:** `DebtCard` faqat `onPay` props ni qabul qiladi. Ustiga bosganda hech narsa bo'lmaydi. `DebtDetail.tsx` mavjud lekin Stack navigator uchun — biz tab navigator ichida modal sifatida ishlatishimiz kerak.

**Files:**
- Create: `apps/mobile/src/screens/Nasiya/DebtDetailSheet.tsx`
- Modify: `apps/mobile/src/screens/Nasiya/DebtCard.tsx`
- Modify: `apps/mobile/src/screens/Nasiya/index.tsx`

- [ ] **Step 1: DebtDetailSheet.tsx yaratish**

Yangi fayl: `apps/mobile/src/screens/Nasiya/DebtDetailSheet.tsx`

```tsx
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, StyleSheet, TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { DebtRecord } from '../../api/nasiya.api';

const C = {
  bg: '#F5F5F7', white: '#FFFFFF', text: '#111827',
  muted: '#9CA3AF', border: '#F3F4F6', primary: '#5B5BD6',
  green: '#10B981', red: '#EF4444', orange: '#F59E0B',
};

function fmt(n: number) { return n.toLocaleString('ru-RU') + ' UZS'; }

interface Props {
  visible: boolean;
  debt: DebtRecord | null;
  onClose: () => void;
  onPay: (debt: DebtRecord) => void;
}

export default function DebtDetailSheet({ visible, debt, onClose, onPay }: Props) {
  if (!debt) return null;

  const remaining = debt.remaining;
  const isPaid = debt.status === 'PAID';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.customerName}>{debt.customer.name}</Text>
            {debt.customer.phone ? (
              <Text style={styles.customerPhone}>{debt.customer.phone}</Text>
            ) : null}
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Amounts summary */}
          <View style={styles.amountsRow}>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Jami nasiya</Text>
              <Text style={styles.amountValue}>{fmt(debt.totalAmount)}</Text>
            </View>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>To'langan</Text>
              <Text style={[styles.amountValue, { color: C.green }]}>{fmt(debt.paidAmount)}</Text>
            </View>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Qoldiq</Text>
              <Text style={[styles.amountValue, { color: remaining > 0 ? C.red : C.green }]}>
                {fmt(remaining)}
              </Text>
            </View>
          </View>

          {/* Debt notes */}
          {debt.notes ? (
            <View style={styles.notesBox}>
              <Ionicons name="document-text-outline" size={14} color={C.orange} style={{ marginRight: 6 }} />
              <Text style={styles.notesText}>{debt.notes}</Text>
            </View>
          ) : null}

          {/* Payment history */}
          {debt.payments && debt.payments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>To'lov tarixi</Text>
              {debt.payments.map((p) => (
                <View key={p.id} style={styles.payRow}>
                  <View style={styles.payLeft}>
                    <MaterialCommunityIcons name="cash" size={16} color={C.green} />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.payAmount}>{fmt(p.amount)}</Text>
                      {p.note ? <Text style={styles.payNote}>{p.note}</Text> : null}
                    </View>
                  </View>
                  <Text style={styles.payDate}>
                    {new Date(p.createdAt).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Pay button */}
        {!isPaid && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => { onClose(); onPay(debt); }}
            activeOpacity={0.85}
          >
            <Ionicons name="card-outline" size={18} color={C.white} />
            <Text style={styles.payBtnText}>To'lov qilish</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 34, maxHeight: '80%',
  },
  handle: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  customerName: { fontSize: 18, fontWeight: '800', color: C.text },
  customerPhone: { fontSize: 13, color: C.muted, marginTop: 2 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  amountsRow: {
    flexDirection: 'row', gap: 10, marginTop: 16,
  },
  amountBox: {
    flex: 1, backgroundColor: C.bg, borderRadius: 12,
    padding: 12, alignItems: 'center',
  },
  amountLabel: { fontSize: 11, color: C.muted, fontWeight: '500' },
  amountValue: { fontSize: 14, fontWeight: '700', color: C.text, marginTop: 4 },
  notesBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFBEB', borderRadius: 10,
    padding: 10, marginTop: 12,
  },
  notesText: { flex: 1, fontSize: 13, color: '#92400E' },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: C.muted,
    letterSpacing: 0.8, marginBottom: 10,
  },
  payRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  payLeft: { flexDirection: 'row', alignItems: 'center' },
  payAmount: { fontSize: 14, fontWeight: '700', color: C.text },
  payNote: { fontSize: 11, color: C.muted },
  payDate: { fontSize: 12, color: C.muted },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.primary, borderRadius: 14, height: 52,
    gap: 8, marginTop: 16,
  },
  payBtnText: { color: C.white, fontSize: 15, fontWeight: '700' },
});
```

- [ ] **Step 2: DebtCard ga onPress prop qo'sh**

`DebtCard.tsx` da `Props` interfeysiga qo'sh:
```tsx
interface Props {
  debt: DebtRecord;
  onPay: (debt: DebtRecord) => void;
  onPress?: (debt: DebtRecord) => void;  // ← QO'SHILDI
}
```

DebtCard ning tashqi `TouchableOpacity` (yoki View) ga `onPress` ulash:
```tsx
// Agar karta TouchableOpacity bo'lsa — onPress ni qo'sh
// Agar View bo'lsa — TouchableOpacity ga almashtir
<TouchableOpacity
  style={styles.card}
  onPress={() => onPress?.(debt)}
  activeOpacity={0.9}
>
```

- [ ] **Step 3: NasiyaScreen da DebtDetailSheet qo'sh**

`Nasiya/index.tsx` da:
```tsx
import DebtDetailSheet from './DebtDetailSheet';

// State lar:
const [detailDebt, setDetailDebt]     = useState<DebtRecord | null>(null);
const [detailVisible, setDetailVisible] = useState(false);

// Handler:
const handleDebtPress = (debt: DebtRecord) => {
  setDetailDebt(debt);
  setDetailVisible(true);
};
```

`renderItem` da:
```tsx
<DebtCard
  debt={item}
  onPay={handlePay}
  onPress={handleDebtPress}     // ← QO'SHILDI
/>
```

JSX ga qo'sh:
```tsx
<DebtDetailSheet
  visible={detailVisible}
  debt={detailDebt}
  onClose={() => setDetailVisible(false)}
  onPay={(debt) => { setDetailVisible(false); handlePay(debt); }}
/>
```

- [ ] **Step 4: Tekshir — debt karta ustiga bosganda detail sheet chiqadi, summa va to'lov tarixi ko'rinadi**

### Task 5: Nasiya FAB + tugmasini o'chir

**Files:**
- Modify: `apps/mobile/src/screens/Nasiya/index.tsx`

- [ ] **Step 5: FAB va unga bog'liq state ni o'chir**

`Nasiya/index.tsx` dan o'chir:
1. `newDebtVisible` state (`useState(false)`) — LEKIN saqlab qol, chunki route params auto-open uchun kerak
2. FAB tugmasi JSX ni o'chir (lines 195–202):
```tsx
{/* O'CHIR: */}
<TouchableOpacity
  style={styles.fab}
  activeOpacity={0.85}
  onPress={() => setNewDebtVisible(true)}
>
  <Ionicons name="add" size={28} color={C.white} />
</TouchableOpacity>
```
3. `fab` style ni o'chir

- [ ] **Step 6: Tekshir — Nasiya screen da + tugmasi ko'rinmaydi**

- [ ] **Step 7: Commit**
```bash
git add apps/mobile/src/screens/Nasiya/DebtDetailSheet.tsx apps/mobile/src/screens/Nasiya/DebtCard.tsx apps/mobile/src/screens/Nasiya/index.tsx
git commit -m "feat(mobile): add DebtDetailSheet on card press + remove Nasiya FAB"
```

---

## Chunk 5: Kirim Detail Items Fix

### Task 6: Kirim receipt card ustiga bosib mahsulotlar ko'rinishi

**Muammo:** `useKirimData.ts` mock data da `items` array YO'Q — faqat `itemsCount: number` bor. Shuning uchun `DetailSheet` da `receipt.items ?? []` = `[]` va "0 ta mahsulot" ko'rinadi.

**Files:**
- Modify: `apps/mobile/src/screens/Kirim/useKirimData.ts`

- [ ] **Step 1: Mock data ga items qo'sh**

`useKirimData.ts` da `makeDemoReceipts` funksiyasiga har bir receipt uchun `items` array qo'sh:

```ts
import type { ReceiptListResponse } from '../../api/inventory.api';

function makeDemoReceipts(): ReceiptListResponse {
  return {
    items: [
      {
        id: '1',
        receiptNumber: 'KR-00245',
        date: '2026-03-10',
        supplierName: 'Loreal Distribution',
        itemsCount: 6,
        totalCost: 4_850_000,
        status: 'RECEIVED',
        items: [
          { productId: 'p1', productName: 'L\'Oreal Shampoo 400ml', qty: 10, unit: 'dona', costPrice: 180_000 },
          { productId: 'p2', productName: 'L\'Oreal Conditioner 300ml', qty: 8, unit: 'dona', costPrice: 160_000 },
          { productId: 'p3', productName: 'L\'Oreal Hair Mask', qty: 5, unit: 'dona', costPrice: 220_000 },
          { productId: 'p4', productName: 'L\'Oreal Color Cream', qty: 12, unit: 'dona', costPrice: 95_000 },
          { productId: 'p5', productName: 'L\'Oreal Serum', qty: 6, unit: 'dona', costPrice: 310_000 },
          { productId: 'p6', productName: 'L\'Oreal Spray', qty: 4, unit: 'dona', costPrice: 145_000 },
        ],
      },
      {
        id: '2',
        receiptNumber: 'KR-00244',
        date: '2026-03-09',
        supplierName: 'Nivea Uzbekistan',
        itemsCount: 4,
        totalCost: 2_340_000,
        status: 'PENDING',
        items: [
          { productId: 'n1', productName: 'Nivea Soft Cream 200ml', qty: 20, unit: 'dona', costPrice: 55_000 },
          { productId: 'n2', productName: 'Nivea Body Lotion', qty: 15, unit: 'dona', costPrice: 70_000 },
          { productId: 'n3', productName: 'Nivea Face Wash', qty: 12, unit: 'dona', costPrice: 65_000 },
          { productId: 'n4', productName: 'Nivea Lip Care', qty: 25, unit: 'dona', costPrice: 30_000 },
        ],
      },
      {
        id: '3',
        receiptNumber: 'KR-00243',
        date: '2026-03-08',
        supplierName: 'Garnier Official',
        itemsCount: 3,
        totalCost: 1_920_000,
        status: 'RECEIVED',
        items: [
          { productId: 'g1', productName: 'Garnier Micellar Water 400ml', qty: 18, unit: 'dona', costPrice: 45_000 },
          { productId: 'g2', productName: 'Garnier BB Cream', qty: 10, unit: 'dona', costPrice: 95_000 },
          { productId: 'g3', productName: 'Garnier Vitamin C Serum', qty: 8, unit: 'dona', costPrice: 120_000 },
        ],
      },
      {
        id: '4',
        receiptNumber: 'KR-00242',
        date: '2026-03-07',
        supplierName: 'Procter & Gamble',
        itemsCount: 5,
        totalCost: 3_150_000,
        status: 'RECEIVED',
        items: [
          { productId: 'pg1', productName: 'Pantene Shampoo 500ml', qty: 12, unit: 'dona', costPrice: 75_000 },
          { productId: 'pg2', productName: 'Head & Shoulders', qty: 10, unit: 'dona', costPrice: 80_000 },
          { productId: 'pg3', productName: 'Oral-B Toothbrush', qty: 24, unit: 'dona', costPrice: 35_000 },
          { productId: 'pg4', productName: 'Gillette Razor', qty: 15, unit: 'dona', costPrice: 55_000 },
          { productId: 'pg5', productName: 'Ariel Washing Powder 1kg', qty: 20, unit: 'dona', costPrice: 45_000 },
        ],
      },
      {
        id: '5',
        receiptNumber: 'KR-00241',
        date: '2026-03-05',
        supplierName: 'Chanel Boutique',
        itemsCount: 2,
        totalCost: 8_400_000,
        status: 'CANCELLED',
        items: [
          { productId: 'c1', productName: 'Chanel No.5 EDP 50ml', qty: 3, unit: 'dona', costPrice: 1_800_000 },
          { productId: 'c2', productName: 'Chanel Coco Mademoiselle 100ml', qty: 2, unit: 'dona', costPrice: 2_400_000 },
        ],
      },
    ],
    total: 5,
    page: 1,
    limit: 20,
  };
}
```

- [ ] **Step 2: Tekshir — Kirim screen da receipt ustiga bosganda mahsulotlar nomi, miqdori, narxi ko'rinadi**

- [ ] **Step 3: Commit**
```bash
git add apps/mobile/src/screens/Kirim/useKirimData.ts
git commit -m "fix(mobile): add mock items to Kirim receipts so detail sheet shows products"
```

---

## Chunk 6: Low Stock Notification Bell

### Task 7: Savdo screen bell da kam qolgan mahsulotlar

**Muammo:** Bell icon (`Ionicons "notifications-outline"`) placeholder — onPress yo'q, badge yo'q.

**Files:**
- Create: `apps/mobile/src/screens/Savdo/LowStockSheet.tsx`
- Modify: `apps/mobile/src/screens/Savdo/index.tsx`

- [ ] **Step 1: LowStockSheet.tsx yaratish**

Yangi fayl: `apps/mobile/src/screens/Savdo/LowStockSheet.tsx`

```tsx
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, StyleSheet, TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { Product } from './ProductCard';

const C = {
  bg: '#F5F5F7', white: '#FFFFFF', text: '#111827',
  muted: '#9CA3AF', border: '#F3F4F6', primary: '#5B5BD6',
  orange: '#F59E0B', red: '#EF4444',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  lowStockProducts: Product[];   // qty > 0 && qty <= minStockLevel
  outOfStockProducts: Product[]; // qty === 0
}

export default function LowStockSheet({ visible, onClose, lowStockProducts, outOfStockProducts }: Props) {
  const total = lowStockProducts.length + outOfStockProducts.length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mahsulot ogohlantirishlari</Text>
            <Text style={styles.subtitle}>{total} ta mahsulot diqqat talab</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Tugagan mahsulotlar */}
          {outOfStockProducts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: C.red }]} />
                <Text style={[styles.sectionTitle, { color: C.red }]}>
                  Tugagan ({outOfStockProducts.length} ta)
                </Text>
              </View>
              {outOfStockProducts.map((p) => (
                <View key={p.id} style={styles.productRow}>
                  <View style={[styles.productIcon, { backgroundColor: '#FEE2E2' }]}>
                    <MaterialCommunityIcons name="package-variant-closed" size={18} color={C.red} />
                  </View>
                  <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                  <View style={[styles.stockBadge, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.stockBadgeText, { color: C.red }]}>0 DONA</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Kam qolgan mahsulotlar */}
          {lowStockProducts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: C.orange }]} />
                <Text style={[styles.sectionTitle, { color: C.orange }]}>
                  Kam qolgan ({lowStockProducts.length} ta)
                </Text>
              </View>
              {lowStockProducts.map((p) => (
                <View key={p.id} style={styles.productRow}>
                  <View style={[styles.productIcon, { backgroundColor: '#FEF3C7' }]}>
                    <MaterialCommunityIcons name="package-variant" size={18} color={C.orange} />
                  </View>
                  <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                  <View style={[styles.stockBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.stockBadgeText, { color: C.orange }]}>{p.stockQty} DONA</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {total === 0 && (
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={48} color={C.muted} />
              <Text style={styles.emptyText}>Barcha mahsulotlar yetarli</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 34, maxHeight: '75%',
  },
  handle: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  title: { fontSize: 17, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 12, color: C.muted, marginTop: 2 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  section: { marginTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700' },
  productRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.border,
  },
  productIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  productName: { flex: 1, fontSize: 13, fontWeight: '500', color: C.text },
  stockBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  stockBadgeText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, color: C.muted },
});
```

- [ ] **Step 2: Savdo/index.tsx da low stock logic va bell handler qo'sh**

`Savdo/index.tsx` da import lar ga qo'sh:
```tsx
import LowStockSheet from './LowStockSheet';
```

Mavjud `useState` lar dan keyin:
```tsx
const [lowStockVisible, setLowStockVisible] = useState(false);

const lowStockProducts = useMemo(
  () => MOCK_PRODUCTS.filter((p) => p.stockQty > 0 && p.stockQty <= p.minStockLevel),
  [],
);
const outOfStockProducts = useMemo(
  () => MOCK_PRODUCTS.filter((p) => p.stockQty === 0),
  [],
);
const alertCount = lowStockProducts.length + outOfStockProducts.length;
```

- [ ] **Step 3: Bell icon ga badge va onPress qo'sh**

```tsx
{/* Header ichida bell icon: */}
<TouchableOpacity
  style={styles.headerIcon}
  activeOpacity={0.7}
  onPress={() => setLowStockVisible(true)}   // ← QO'SHILDI
>
  <Ionicons name="notifications-outline" size={22} color={C.text} />
  {alertCount > 0 && (
    <View style={styles.bellBadge}>
      <Text style={styles.bellBadgeText}>{alertCount}</Text>
    </View>
  )}
</TouchableOpacity>
```

Stillar:
```tsx
bellBadge: {
  position: 'absolute',
  top: -2,
  right: -2,
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: '#EF4444',
  alignItems: 'center',
  justifyContent: 'center',
},
bellBadgeText: {
  color: '#FFFFFF',
  fontSize: 9,
  fontWeight: '700',
},
```

- [ ] **Step 4: LowStockSheet render qil**

Savdo screen JSX da `<ScannerModal>` dan keyin:
```tsx
<LowStockSheet
  visible={lowStockVisible}
  onClose={() => setLowStockVisible(false)}
  lowStockProducts={lowStockProducts}
  outOfStockProducts={outOfStockProducts}
/>
```

- [ ] **Step 5: Tekshir — Bell icon da qizil badge ko'rinadi, bosish da sheet ochiladi, kamaygan va tugagan mahsulotlar ko'rinadi**

- [ ] **Step 6: Commit**
```bash
git add apps/mobile/src/screens/Savdo/LowStockSheet.tsx apps/mobile/src/screens/Savdo/index.tsx
git commit -m "feat(mobile): add low stock notification bell with badge in Savdo screen"
```

---

## Yakuniy Tekshiruv

- [ ] Smena oching → Savdo da "To'lov →" ko'rinadi ✓
- [ ] Mahsulot qo'shganda "-/+" tugmalari chiqadi ✓
- [ ] NASIYA tanlanganda Nasiya screen da sheet avtomatik ochiladi, summa to'ldirilgan ✓
- [ ] Nasiya karta ustiga bosganda detail sheet ko'rinadi ✓
- [ ] Nasiya screen da + tugma yo'q ✓
- [ ] Kirim da receipt ustiga bosganda mahsulotlar ko'rinadi ✓
- [ ] Savdo bell da badge va sheet ko'rinadi ✓

```bash
git log --oneline -7
```
