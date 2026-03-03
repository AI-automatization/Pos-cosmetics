import { randomUUID } from 'crypto';

export function generateIdempotencyKey(): string {
  return randomUUID();
}

export function generateTransactionRef(prefix = 'TXN'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
