import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'Chilonzor filiali' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Toshkent, Chilonzor 9-kvartal' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateBranchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Injectable()
export class BranchService {
  private readonly logger = new Logger(BranchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getBranches(tenantId: string, isActive?: boolean) {
    return this.prisma.branch.findMany({
      where: {
        tenantId,
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { shifts: true, orders: true, warehouses: true },
        },
      },
    });
  }

  async getBranchById(tenantId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, tenantId },
      include: {
        warehouses: { select: { id: true, name: true, isActive: true } },
        _count: { select: { shifts: true, orders: true } },
      },
    });
    if (!branch) throw new NotFoundException(`Branch ${id} not found`);
    return branch;
  }

  async createBranch(tenantId: string, dto: CreateBranchDto) {
    const branch = await this.prisma.branch.create({
      data: { tenantId, name: dto.name, address: dto.address },
    });
    this.logger.log(`Branch created: ${branch.id}`, { tenantId });
    return branch;
  }

  async updateBranch(tenantId: string, id: string, dto: UpdateBranchDto) {
    await this.findOrFail(tenantId, id);
    const updated = await this.prisma.branch.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    this.logger.log(`Branch updated: ${id}`, { tenantId });
    return updated;
  }

  async deactivateBranch(tenantId: string, id: string) {
    await this.findOrFail(tenantId, id);
    await this.prisma.branch.update({
      where: { id },
      data: { isActive: false },
    });
    this.logger.log(`Branch deactivated: ${id}`, { tenantId });
    return { success: true };
  }

  async getBranchStats(tenantId: string, id: string) {
    await this.findOrFail(tenantId, id);

    const [totalOrders, totalRevenue, activeShifts] = await this.prisma.$transaction([
      this.prisma.order.count({ where: { tenantId, branchId: id } }),
      this.prisma.order.aggregate({
        where: { tenantId, branchId: id, status: 'COMPLETED' },
        _sum: { total: true },
      }),
      this.prisma.shift.count({
        where: { tenantId, branchId: id, status: 'OPEN' },
      }),
    ]);

    return {
      branchId: id,
      totalOrders,
      totalRevenue: totalRevenue._sum.total ?? 0,
      activeShifts,
    };
  }

  private async findOrFail(tenantId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, tenantId },
    });
    if (!branch) throw new NotFoundException(`Branch ${id} not found`);
    return branch;
  }
}
