export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  tenantId: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
}

// Sale events
export const SALE_CREATED = 'sale.created';
export const SALE_COMPLETED = 'sale.completed';
export const SALE_CANCELLED = 'sale.cancelled';

// Inventory events
export const INVENTORY_DEDUCTED = 'inventory.deducted';
export const INVENTORY_RECEIVED = 'inventory.received';
export const INVENTORY_ADJUSTED = 'inventory.adjusted';

// Payment events
export const PAYMENT_CREATED = 'payment.created';
export const PAYMENT_CONFIRMED = 'payment.confirmed';
export const PAYMENT_SETTLED = 'payment.settled';
export const PAYMENT_FAILED = 'payment.failed';

// Ledger events
export const LEDGER_ENTRY_CREATED = 'ledger.entry.created';
export const LEDGER_ENTRY_REVERSED = 'ledger.entry.reversed';
