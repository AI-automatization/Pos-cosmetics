import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, search?: string, branchId?: string) {
    const [customers, debtAggregates] = await Promise.all([
      this.prisma.customer.findMany({
        where: {
          tenantId,
          isActive: true,
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }),
          ...(branchId && { branchId }),
        },
        include: { branch: { select: { id: true, name: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.debtRecord.groupBy({
        by: ['customerId'],
        where: {
          tenantId,
          status: { in: ['ACTIVE', 'PARTIAL', 'OVERDUE'] },
        },
        _sum: { remaining: true },
      }),
    ]);

    const debtMap = new Map(
      debtAggregates.map((d) => [d.customerId, Number(d._sum.remaining ?? 0)]),
    );

    return customers.map((c) => ({
      ...c,
      debtBalance: debtMap.get(c.id) ?? 0,
    }));
  }

  async findById(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
    });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async create(tenantId: string, dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data: {
        tenantId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        address: dto.address,
        gender: dto.gender,
        debtLimit: dto.debtLimit ?? 0,
        notes: dto.notes,
        branchId: dto.branchId ?? null,
      },
    });
    this.logger.log(`Customer created: ${customer.id}`, { tenantId });
    return customer;
  }

  async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
    await this.findById(tenantId, id);
    return this.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.birthDate !== undefined && { birthDate: dto.birthDate ? new Date(dto.birthDate) : null }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.debtLimit !== undefined && { debtLimit: dto.debtLimit }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.branchId !== undefined && { branchId: dto.branchId || null }),
      },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    await this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true };
  }

  async getCustomerStats(tenantId: string, id: string) {
    await this.findById(tenantId, id);

    const [orderCount, totalSpent, debtBalance] = await Promise.all([
      this.prisma.order.count({ where: { tenantId, customerId: id } }),
      this.prisma.order.aggregate({
        where: { tenantId, customerId: id },
        _sum: { total: true },
      }),
      this.prisma.debtRecord.aggregate({
        where: { tenantId, customerId: id, status: { in: ['ACTIVE', 'PARTIAL', 'OVERDUE'] } },
        _sum: { remaining: true },
      }),
    ]);

    return {
      orderCount,
      totalSpent: totalSpent._sum.total ?? 0,
      debtBalance: debtBalance._sum.remaining ?? 0,
    };
  }
}
