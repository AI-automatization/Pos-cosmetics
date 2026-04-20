import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RealestateService {
  private readonly logger = new Logger(RealestateService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProperties(tenantId: string, opts: { status?: string } = {}) {
    const where: Record<string, unknown> = { tenantId };
    if (opts.status) where['status'] = opts.status;

    const properties = await this.prisma.property.findMany({
      where,
      include: {
        contracts: {
          where: { isActive: true },
          select: { lesseeName: true, lesseePhone: true, startDate: true, endDate: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return properties.map((p) => {
      const contract = p.contracts[0];
      return {
        id: p.id,
        name: p.name,
        address: p.address,
        type: p.type,
        status: p.status,
        rentAmount: Number(p.rentAmount),
        currency: p.currency,
        area: p.area ? Number(p.area) : undefined,
        occupancyRate: p.status === 'RENTED' ? 100 : 0,
        tenantName: contract?.lesseeName,
        tenantPhone: contract?.lesseePhone ?? undefined,
        contractStart: contract?.startDate.toISOString(),
        contractEnd: contract?.endDate.toISOString(),
        roi: p.roi ? Number(p.roi) : undefined,
        createdAt: p.createdAt.toISOString(),
      };
    });
  }

  async getStats(tenantId: string) {
    const [properties, overdueCount] = await Promise.all([
      this.prisma.property.findMany({
        where: { tenantId },
        select: { status: true, rentAmount: true, roi: true },
      }),
      this.prisma.rentalPayment.count({
        where: { tenantId, status: 'OVERDUE' },
      }),
    ]);

    const totalProperties = properties.length;
    const rented = properties.filter((p) => p.status === 'RENTED').length;
    const vacant = properties.filter((p) => p.status === 'VACANT').length;
    const maintenance = properties.filter((p) => p.status === 'MAINTENANCE').length;
    const totalMonthlyRent = properties
      .filter((p) => p.status === 'RENTED')
      .reduce((s, p) => s + Number(p.rentAmount), 0);

    const rois = properties.filter((p) => p.roi !== null).map((p) => Number(p.roi));
    const averageRoi = rois.length > 0 ? rois.reduce((s, r) => s + r, 0) / rois.length : 0;

    this.logger.log(`Real estate stats fetched`, { tenantId, totalProperties });

    return {
      totalProperties,
      rented,
      vacant,
      maintenance,
      totalMonthlyRent,
      currency: 'UZS',
      overduePayments: overdueCount,
      averageRoi: Math.round(averageRoi * 100) / 100,
    };
  }

  async getPayments(
    tenantId: string,
    opts: { status?: string; propertyId?: string; page?: number; limit?: number } = {},
  ) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId };
    if (opts.status) where['status'] = opts.status;
    if (opts.propertyId) where['propertyId'] = opts.propertyId;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.rentalPayment.count({ where }),
      this.prisma.rentalPayment.findMany({
        where,
        skip,
        take: limit,
        include: { property: { select: { name: true } } },
        orderBy: { dueDate: 'desc' },
      }),
    ]);

    const mapped = items.map((p) => ({
      id: p.id,
      propertyId: p.propertyId,
      propertyName: p.property.name,
      tenantName: p.lesseeName,
      amount: Number(p.amount),
      currency: p.currency,
      dueDate: p.dueDate.toISOString(),
      paidDate: p.paidDate?.toISOString(),
      status: p.status,
      month: p.month,
      note: p.note ?? undefined,
    }));

    return { items: mapped, total, page, limit };
  }
}
