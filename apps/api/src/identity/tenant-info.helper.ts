import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTenantInfoDto } from './dto';

@Injectable()
export class TenantInfoHelper {
  private readonly logger = new Logger(TenantInfoHelper.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── T-079: Tenant soliq ma'lumotlari ─────────────────────────

  async getTenantInfo(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        inn: true,
        stir: true,
        oked: true,
        legalName: true,
        legalAddress: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async updateTenantInfo(tenantId: string, dto: UpdateTenantInfoDto) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.inn !== undefined && { inn: dto.inn }),
        ...(dto.stir !== undefined && { stir: dto.stir }),
        ...(dto.oked !== undefined && { oked: dto.oked }),
        ...(dto.legalName !== undefined && { legalName: dto.legalName }),
        ...(dto.legalAddress !== undefined && { legalAddress: dto.legalAddress }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        inn: true,
        stir: true,
        oked: true,
        legalName: true,
        legalAddress: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Tenant info updated: ${tenantId}`);
    return tenant;
  }

  async getBranches(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, address: true, isActive: true },
    });
  }
}
