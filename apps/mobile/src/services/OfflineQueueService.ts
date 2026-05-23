import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CreateOrderPayload } from '@raos/types';

const QUEUE_KEY = '@offline_queue';
const MAX_RETRIES = 5;

export interface QueuedOrder {
  readonly id: string;
  readonly payload: CreateOrderPayload;
  readonly createdAt: string;
  readonly retries: number;
  readonly lastError?: string;
}

export interface QueueStatus {
  readonly pending: number;
  readonly items: ReadonlyArray<QueuedOrder>;
}

function generateId(): string {
  return (
    crypto.randomUUID?.() ??
    Date.now().toString(36) + Math.random().toString(36).slice(2)
  );
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

export const offlineQueueService = {
  /** Add an order to the offline queue */
  async enqueue(payload: CreateOrderPayload): Promise<string> {
    const id = generateId();
    const entry: QueuedOrder = {
      id,
      payload,
      createdAt: new Date().toISOString(),
      retries: 0,
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
  async processQueue(): Promise<{ success: number; failed: number }> {
    const queue = await readQueue();
    if (queue.length === 0) return { success: 0, failed: 0 };

    const { salesApi } = await import('../api/sales.api');
    let success = 0;
    let failed = 0;
    const remaining: QueuedOrder[] = [];

    for (const item of queue) {
      try {
        await salesApi.createOrder(item.payload);
        success += 1;
      } catch (err: unknown) {
        failed += 1;
        const nextRetries = item.retries + 1;
        if (nextRetries < MAX_RETRIES) {
          remaining.push({
            ...item,
            retries: nextRetries,
            lastError:
              err instanceof Error ? err.message : 'Unknown error',
          });
        }
        // Items exceeding MAX_RETRIES are silently dropped
      }
    }

    await writeQueue(remaining);
    return { success, failed };
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
};
