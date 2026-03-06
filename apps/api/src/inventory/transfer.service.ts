import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransferStatus } from '@prisma/client';
import { IsArray, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export class TransferItemDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiPropertyOptional({ description: 'Qaysi ombordan (ixtiyoriy)' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  quantity!: number;
}

export class CreateTransferDto {
  @ApiProperty({ description: 'Qaysi filialdan' })
  @IsUUID()
  fromBranchId!: string;

  @ApiProperty({ description: 'Qaysi filialga' })
  @IsUUID()
  toBranchId!: string;

  @ApiProperty({ type: [TransferItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TransferItemDto)
  items!: TransferItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

// ─── TransferService ──────────────────────────────────────────────────────────

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Create transfer request ──────────────────────────────────────────────

  async requestTransfer(tenantId: string, requestedById: string, dto: CreateTransferDto) {
    if (dto.fromBranchId === dto.toBranchId) {
      throw new BadRequestException('Bir xil filiallar orasida transfer qilib bolmaydi');
    }

    const [fromBranch, toBranch] = await Promise.all([
      this.prisma.branch.findFirst({ where: { id: dto.fromBranchId, tenantId } }),
      this.prisma.branch.findFirst({ where: { id: dto.toBranchId, tenantId } }),
    ]);

    if (!fromBranch) throw new NotFoundException('Manba filial topilmadi');
    if (!toBranch) throw new NotFoundException('Maqsad filial topilmadi');

    const transfer = await this.prisma.stockTransfer.create({
      data: {
        tenantId,
        fromBranchId: dto.fromBranchId,
        toBranchId: dto.toBranchId,
        requestedById,
        notes: dto.notes,
        status: 'REQUESTED',
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            warehouseId: item.warehouseId ?? null,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
        fromBranch: { select: { name: true } },
        toBranch: { select: { name: true } },
        requestedBy: { select: { firstName: true, lastName: true } },
      },
    });

    this.logger.log(`Transfer REQUESTED: ${transfer.id}`, { tenantId });
    return transfer;
  }

  // ─── Approve transfer ─────────────────────────────────────────────────────

  async approveTransfer(tenantId: string, transferId: string, approvedById: string) {
    const transfer = await this.findTransfer(tenantId, transferId);

    if (transfer.status !== 'REQUESTED') {
      throw new BadRequestException(`Transfer ${transfer.status} holatida — approve qilib bolmaydi`);
    }

    return this.prisma.stockTransfer.update({
      where: { id: transferId },
      data: { status: 'APPROVED', approvedById },
      include: { items: true },
    });
  }

  // ─── Ship (mark as shipped) ───────────────────────────────────────────────

  async shipTransfer(tenantId: string, transferId: string, userId: string) {
    const transfer = await this.findTransfer(tenantId, transferId);

    if (transfer.status !== 'APPROVED') {
      throw new BadRequestException(`Transfer ${transfer.status} holatida — ship qilib bolmaydi`);
    }

    // OUT movements: manba filialning omboridan chiqarish
    const warehouses = await this.prisma.warehouse.findMany({
      where: { tenantId, branchId: transfer.fromBranchId, isActive: true },
      select: { id: true },
    });

    const warehouseId = warehouses[0]?.id;

    await this.prisma.$transaction([
      // Transfer holatini SHIPPED ga o'tkazish
      this.prisma.stockTransfer.update({
        where: { id: transferId },
        data: { status: 'SHIPPED' },
      }),
      // Har item uchun OUT movement
      ...transfer.items.map((item) =>
        this.prisma.stockMovement.create({
          data: {
            tenantId,
            warehouseId: item.warehouseId ?? warehouseId ?? '',
            productId: item.productId,
            userId,
            type: 'TRANSFER_OUT',
            quantity: item.quantity,
            refId: transferId,
            refType: 'TRANSFER',
            note: `Transfer to ${transfer.toBranchId}`,
          },
        }),
      ),
    ]);

    this.logger.log(`Transfer SHIPPED: ${transferId}`, { tenantId });
    return this.findTransfer(tenantId, transferId);
  }

  // ─── Receive (complete transfer) ──────────────────────────────────────────

  async receiveTransfer(tenantId: string, transferId: string, userId: string) {
    const transfer = await this.findTransfer(tenantId, transferId);

    if (transfer.status !== 'SHIPPED') {
      throw new BadRequestException(`Transfer ${transfer.status} holatida — receive qilib bolmaydi`);
    }

    const warehouses = await this.prisma.warehouse.findMany({
      where: { tenantId, branchId: transfer.toBranchId, isActive: true },
      select: { id: true },
    });

    const warehouseId = warehouses[0]?.id;

    await this.prisma.$transaction([
      // Transfer holatini RECEIVED ga o'tkazish
      this.prisma.stockTransfer.update({
        where: { id: transferId },
        data: { status: 'RECEIVED' },
      }),
      // Har item uchun IN movement
      ...transfer.items.map((item) =>
        this.prisma.stockMovement.create({
          data: {
            tenantId,
            warehouseId: item.warehouseId ?? warehouseId ?? '',
            productId: item.productId,
            userId,
            type: 'TRANSFER_IN',
            quantity: item.quantity,
            refId: transferId,
            refType: 'TRANSFER',
            note: `Transfer from ${transfer.fromBranchId}`,
          },
        }),
      ),
    ]);

    this.logger.log(`Transfer RECEIVED: ${transferId}`, { tenantId });
    return this.findTransfer(tenantId, transferId);
  }

  // ─── Cancel transfer ──────────────────────────────────────────────────────

  async cancelTransfer(tenantId: string, transferId: string) {
    const transfer = await this.findTransfer(tenantId, transferId);

    if (['SHIPPED', 'RECEIVED'].includes(transfer.status)) {
      throw new ForbiddenException(`${transfer.status} transfer bekor qilib bolmaydi`);
    }

    return this.prisma.stockTransfer.update({
      where: { id: transferId },
      data: { status: 'CANCELLED' },
    });
  }

  // ─── List transfers ────────────────────────────────────────────────────────

  async listTransfers(
    tenantId: string,
    status?: TransferStatus,
    branchId?: string,
    page = 1,
    limit = 20,
  ) {
    const where: { tenantId: string; status?: TransferStatus; OR?: Array<{ fromBranchId: string } | { toBranchId: string }> } = { tenantId };
    if (status) where.status = status;
    if (branchId) where.OR = [{ fromBranchId: branchId }, { toBranchId: branchId }];

    const [items, total] = await Promise.all([
      this.prisma.stockTransfer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: { include: { product: { select: { name: true, sku: true } } } },
          fromBranch: { select: { name: true } },
          toBranch: { select: { name: true } },
          requestedBy: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.stockTransfer.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async findTransfer(tenantId: string, transferId: string) {
    const transfer = await this.prisma.stockTransfer.findFirst({
      where: { id: transferId, tenantId },
      include: { items: true },
    });

    if (!transfer) throw new NotFoundException('Transfer topilmadi');
    return transfer;
  }
}
