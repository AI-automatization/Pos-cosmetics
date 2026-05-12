import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateUnitDto } from './dto';

@Injectable()
export class CatalogCategoryHelper {
  private readonly logger = new Logger(CatalogCategoryHelper.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── CATEGORIES ───────────────────────────────────────────────

  async getCategories(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        children: {
          where: { deletedAt: null },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    });
  }

  async createCategory(tenantId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        tenantId,
        name: dto.name,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateCategory(tenantId: string, id: string, dto: UpdateCategoryDto) {
    await this.findCategoryOrFail(tenantId, id);
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async deleteCategory(tenantId: string, id: string) {
    await this.findCategoryOrFail(tenantId, id);
    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  async findCategoryOrFail(tenantId: string, id: string) {
    const cat = await this.prisma.category.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    return cat;
  }

  // ─── UNITS ────────────────────────────────────────────────────

  async getUnits(tenantId: string) {
    return this.prisma.unit.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async createUnit(tenantId: string, dto: CreateUnitDto) {
    return this.prisma.unit.create({
      data: { tenantId, name: dto.name, shortName: dto.shortName },
    });
  }
}
