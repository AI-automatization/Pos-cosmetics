import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CreateOrderPayload } from '@raos/types';

const QUEUE_KEY = '@offline_queue';
const FAILED_KEY = '@offline_queue_failed';
const MAX_RETRIES = 5;

/**
 * Concurrency guard: prevents two overlapping triggers
 * (network-regained + manual refresh) from draining the same items twice.
 */
let isProcessing = false;

export interface QueuedOrder {
  readonly id: string;
  readonly payload: CreateOrderPayload;
  readonly idempotencyKey: string;
  readonly createdAt: string;
  readonly retries: number;
  readonly lastError?: string;
  /**
   * T-485: Loyalty context captured at enqueue time so an offline sale
   * deducts points on sync — keeps cash discount and points consistent.
   * Only meaningful when redeemPoints > 0.
   */
  readonly customerId?: string;
  readonly redeemPoints?: number;
}

export interface QueueStatus {
  readonly pending: number;
  readonly items: ReadonlyArray<QueuedOrder>;
}

function generateId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    Date.now().toString(36) + Math.random().toString(36).slice(2)
  );
}

/**
 * T-481: Stable idempotency key for a single order submission.
 * Reuses the crypto-safe id generator (globalThis.crypto with fallback).
 * The same key must be reused byte-for-byte on every offline retry.
 */
export function newIdempotencyKey(): string {
  return generateId();
}

async function readQueue(): Promise<QueuedOrder[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedOrder[];
  } catch {
    return [];
  }
}

async function writeQueue(items: QueuedOrder[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

async function readFailed(): Promise<QueuedOrder[]> {
  try {
    const raw = await AsyncStorage.getItem(FAILED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedOrder[];
  } catch {
    return [];
  }
}

async function writeFailed(items: QueuedOrder[]): Promise<void> {
  await AsyncStorage.setItem(FAILED_KEY, JSON.stringify(items));
}

export const offlineQueueService = {
  /** Add an order to the offline queue */
  async enqueue(
    payload: CreateOrderPayload,
    idempotencyKey: string,
    customerId?: string,
    redeemPoints?: number,
  ): Promise<string> {
    const id = generateId();
    // Only persist loyalty context when there are points to redeem.
    const hasRedeem = customerId !== undefined && (redeemPoints ?? 0) > 0;
    const entry: QueuedOrder = {
      id,
      payload,
      idempotencyKey,
      createdAt: new Date().toISOString(),
      retries: 0,
      ...(hasRedeem ? { customerId, redeemPoints } : {}),
    };
    const queue = await readQueue();
    queue.push(entry);
    await writeQueue(queue);
    return id;
  },

  /** Get current queue status */
  async getStatus(): Promise<QueueStatus> {
    const items = await readQueue();
    return { pending: items.length, items };
  },

  /** Process all pending items (call when back online) */
  async processQueue(): Promise<{ success: number; failed: number; deadLettered: number }> {
    // Concurrency guard: skip if another drain is already running so two
    // overlapping triggers can't process the same items twice.
    if (isProcessing) return { success: 0, failed: 0, deadLettered: 0 };
    isProcessing = true;
    try {
      const queue = await readQueue();
      if (queue.length === 0) return { success: 0, failed: 0, deadLettered: 0 };

      const { salesApi } = await import('../api/sales.api');
      let success = 0;
      let failed = 0;
      const remaining: QueuedOrder[] = [];
      const deadLetter: QueuedOrder[] = [];

      for (const item of queue) {
        try {
          const order = await salesApi.createOrder(item.payload, item.idempotencyKey);
          // T-485: deduct loyalty points for offline sales on sync, mirroring
          // the online NAQD/KARTA path. Best-effort — a redeem failure must NOT
          // re-queue or fail an order that already succeeded server-side.
          if (item.customerId && (item.redeemPoints ?? 0) > 0) {
            try {
              const { loyaltyApi } = await import('../api/loyalty.api');
              await loyaltyApi.redeem(item.customerId, item.redeemPoints!, order.id);
            } catch {
              /* best-effort, same as the online path; do not fail the synced order */
            }
          }
          success += 1;
        } catch (err: unknown) {
          failed += 1;
          const nextRetries = item.retries + 1;
          const retried: QueuedOrder = {
            ...item,
            retries: nextRetries,
            lastError: err instanceof Error ? err.message : 'Unknown error',
          };
          if (nextRetries < MAX_RETRIES) {
            remaining.push(retried);
          } else {
            // T-482: orders exceeding MAX_RETRIES are moved to a dead-letter
            // store — a financial/inventory record must never silently vanish.
            deadLetter.push(retried);
          }
        }
      }

      await writeQueue(remaining);
      if (deadLetter.length > 0) {
        const existingFailed = await readFailed();
        await writeFailed([...existingFailed, ...deadLetter]);
      }
      return { success, failed, deadLettered: deadLetter.length };
    } finally {
      isProcessing = false;
    }
  },

  /** Remove a specific item from queue */
  async remove(id: string): Promise<void> {
    const queue = await readQueue();
    await writeQueue(queue.filter((item) => item.id !== id));
  },

  /** Clear entire queue */
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },

  /** T-482: Get dead-lettered orders that exhausted MAX_RETRIES */
  async getFailed(): Promise<QueuedOrder[]> {
    return readFailed();
  },

  /** T-482: Clear the dead-letter store (after manual resolution) */
  async clearFailed(): Promise<void> {
    await AsyncStorage.removeItem(FAILED_KEY);
  },
};
