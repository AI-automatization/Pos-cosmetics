import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InventoryService } from '../inventory/inventory.service';
import { PrismaService } from '../prisma/prisma.service';

interface SaleCreatedPayload {
  tenantId: string;
  orderId: string;
  userId: string;
  customerId?: string;
  items: Array<{ productId: string; quantity: number }>;
  total: number;
}

interface ReturnApprovedPayload {
  tenantId: string;
  returnId: string;
  items: Array<{ productId: string; quantity: number }>;
}

@Injectable()
export class SaleEventListener {
  private readonly logger = new Logger(SaleEventListener.name);

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('sale.created')
  async handleSaleCreated(payload: SaleCreatedPayload) {
    this.logger.log(`Handling sale.created for order ${payload.orderId}`, {
      tenantId: payload.tenantId,
    });

    // Get default warehouse for tenant (first active warehouse)
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { tenantId: payload.tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!warehouse) {
      this.logger.warn(
        `No warehouse found for tenant ${payload.tenantId} — skipping inventory deduction`,
      );
      return;
    }

    try {
      await this.inventoryService.deductStock(
        payload.tenantId,
        warehouse.id,
        payload.items,
        payload.orderId,
      );
    } catch (err) {
      this.logger.error(
        `Failed to deduct stock for order ${payload.orderId}`,
        { error: (err as Error).message, tenantId: payload.tenantId },
      );
    }
  }

  @OnEvent('return.approved')
  async handleReturnApproved(payload: ReturnApprovedPayload) {
    this.logger.log(`Handling return.approved: ${payload.returnId}`, {
      tenantId: payload.tenantId,
    });

    const warehouse = await this.prisma.warehouse.findFirst({
      where: { tenantId: payload.tenantId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!warehouse) return;

    try {
      const movements = payload.items.map((item) => ({
        tenantId: payload.tenantId,
        warehouseId: warehouse.id,
        productId: item.productId,
        type: 'RETURN_IN' as const,
        quantity: item.quantity,
        refId: payload.returnId,
        refType: 'RETURN',
      }));

      await this.prisma.stockMovement.createMany({ data: movements });

      this.logger.log(
        `Stock returned for return ${payload.returnId}: ${payload.items.length} items`,
        { tenantId: payload.tenantId },
      );
    } catch (err) {
      this.logger.error(
        `Failed to return stock for return ${payload.returnId}`,
        { error: (err as Error).message },
      );
    }
  }
}
