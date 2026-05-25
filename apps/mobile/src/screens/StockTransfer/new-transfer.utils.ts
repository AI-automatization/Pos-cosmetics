import { Alert } from 'react-native';
import { extractErrorMessage } from '../../utils/error';
import type { CreateTransferBody } from '../../api/inventory.api';

export interface AddedItem {
  key: string;
  productId: string;
  productName: string;
  quantity: number;
  warehouseId: string;
  warehouseName: string;
  availableQty: number;
}

/**
 * Validates transfer form fields. Returns true if valid, shows Alert and returns false otherwise.
 */
export function validateTransferForm(
  fromBranchId: string,
  toBranchId: string,
  addedItems: AddedItem[],
  qtyInputMap: Record<string, string>,
): boolean {
  if (!fromBranchId) {
    Alert.alert('Xatolik', "Qayerdan filialini tanlang");
    return false;
  }
  if (!toBranchId) {
    Alert.alert('Xatolik', "Qayerga filialini tanlang");
    return false;
  }
  if (fromBranchId === toBranchId) {
    Alert.alert('Xatolik', "Bir xil filialga o'tkazib bo'lmaydi");
    return false;
  }
  if (addedItems.length === 0) {
    Alert.alert('Xatolik', "Kamida bitta mahsulot qo'shing");
    return false;
  }

  for (const item of addedItems) {
    const rawQty = qtyInputMap[item.key] ?? '';
    const parsed = parseFloat(rawQty.replace(',', '.'));
    if (!rawQty.trim() || isNaN(parsed) || parsed <= 0) {
      Alert.alert('Xatolik', `"${item.productName}" uchun miqdor kiriting`);
      return false;
    }
    if (parsed > item.availableQty) {
      Alert.alert(
        'Xatolik',
        `"${item.productName}" uchun miqdor mavjud qoldiqdan oshib ketdi. Maksimal: ${item.availableQty} dona`,
      );
      return false;
    }
  }

  return true;
}

/**
 * Builds the API payload from form state.
 */
export function buildTransferPayload(
  fromBranchId: string,
  toBranchId: string,
  addedItems: AddedItem[],
  notes: string,
): CreateTransferBody {
  return {
    fromBranchId,
    toBranchId,
    items: addedItems.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      warehouseId: i.warehouseId || undefined,
    })),
    notes: notes.trim() || undefined,
  };
}

/**
 * Handles submit error by showing an Alert.
 */
export function handleTransferError(err: unknown): void {
  Alert.alert('Xatolik', extractErrorMessage(err));
}
