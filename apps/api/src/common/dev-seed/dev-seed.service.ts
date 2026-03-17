import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import {
  DebtStatus,
  NotificationType,
  OrderStatus,
  PaymentIntentStatus,
  PaymentMethod,
  ShiftStatus,
  StockMovementType,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

const TENANT_SLUG = 'kosmetika-demo';

/**
 * Auto-seeds kosmetika-demo tenant on first Railway deploy.
 * Skipped if tenant already exists (idempotent).
 */
@Injectable()
export class DevSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DevSeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    try {
      const exists = await this.prisma.tenant.findUnique({
        where: { slug: TENANT_SLUG },
      });
      if (exists) {
        this.logger.log(`Seed skipped — tenant "${TENANT_SLUG}" already exists`);
        return;
      }
      await this.seed();
    } catch (err) {
      this.logger.warn(`Dev seed failed (non-fatal): ${(err as Error).message}`);
    }
  }

  private async seed() {
    this.logger.log('🌱 Seeding kosmetika-demo...');
    const hash = await bcrypt.hash('Demo1234!', 12);

    // 1. Tenant
    const tenant = await this.prisma.tenant.create({
      data: { name: 'Kosmetika Savdosi', slug: TENANT_SLUG },
    });

    // 2. Owner
    const owner = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'owner@kosmetika.uz',
        passwordHash: hash,
        firstName: 'Akbar',
        lastName: 'Tursunov',
        role: UserRole.OWNER,
      },
    });

    // 3. Branches
    const branchData = [
      { name: 'Chilonzor',       address: "Chilonzor tumani, 14-mavze" },
      { name: 'Yunusabad',        address: "Yunusabad, Amir Temur ko'ch 45" },
      { name: "Mirzo Ulug'bek",  address: "Mirzo Ulug'bek, Ko'yluk bozor" },
      { name: 'Sergeli',          address: "Sergeli tumani, Yangi hayot" },
    ];
    const branches = await Promise.all(
      branchData.map((b) =>
        this.prisma.branch.create({ data: { tenantId: tenant.id, ...b } }),
      ),
    );

    // 4. Cashiers (one per branch)
    const cashierData = [
      { firstName: 'Sarvar',   lastName: 'Qodirov',   email: 'sarvar@kosmetika.uz' },
      { firstName: 'Jahongir', lastName: 'Nazarov',   email: 'jahongir@kosmetika.uz' },
      { firstName: 'Zulfiya',  lastName: 'Ergasheva', email: 'zulfiya@kosmetika.uz' },
      { firstName: 'Muhabbat', lastName: 'Tosheva',   email: 'muhabbat@kosmetika.uz' },
    ];
    const cashiers = await Promise.all(
      cashierData.map((c) =>
        this.prisma.user.create({
          data: { tenantId: tenant.id, passwordHash: hash, role: UserRole.CASHIER, ...c },
        }),
      ),
    );

    // 5. Category + Products
    const category = await this.prisma.category.create({
      data: { tenantId: tenant.id, name: 'Kosmetika' },
    });

    const productData = [
      { name: 'Chanel No.5 EDP 100ml',   sku: 'CH-N5-100',    cost: 850_000,  sell: 1_200_000, min: 5 },
      { name: 'Dior Sauvage EDT 100ml',  sku: 'DR-SAU-100',   cost: 780_000,  sell: 1_100_000, min: 5 },
      { name: "L'Oreal Elvive Shampoo",  sku: 'LOR-ELV-400',  cost: 45_000,   sell: 72_000,    min: 20 },
      { name: 'Nivea Soft Cream 300ml',  sku: 'NIV-SOFT-300', cost: 38_000,   sell: 58_000,    min: 20 },
      { name: 'MAC Lipstick Ruby Woo',   sku: 'MAC-LIP-RW',   cost: 280_000,  sell: 420_000,   min: 10 },
      { name: 'Versace Eros EDT 100ml',  sku: 'VER-ERO-100',  cost: 920_000,  sell: 1_350_000, min: 3 },
      { name: 'Garnier Vitamin C Serum', sku: 'GAR-VIT-30',   cost: 65_000,   sell: 98_000,    min: 15 },
      { name: 'NYX Eyeshadow Palette',   sku: 'NYX-PAL-ULT',  cost: 185_000,  sell: 275_000,   min: 8 },
      { name: 'Maybelline Mascara',      sku: 'MAY-MAS-BIG',  cost: 55_000,   sell: 82_000,    min: 20 },
      { name: 'KIKO Milano Lipstick',    sku: 'KIK-LIP-315',  cost: 95_000,   sell: 148_000,   min: 10 },
    ];

    const products = await Promise.all(
      productData.map((p) =>
        this.prisma.product.create({
          data: {
            tenantId: tenant.id,
            categoryId: category.id,
            name: p.name,
            sku: p.sku,
            costPrice: p.cost,
            sellPrice: p.sell,
            minStockLevel: p.min,
            isActive: true,
          },
        }),
      ),
    );

    // 6. Warehouses + stock movements
    for (let bi = 0; bi < branches.length; bi++) {
      const branch = branches[bi];
      const wh = await this.prisma.warehouse.create({
        data: { tenantId: tenant.id, branchId: branch.id, name: `${branch.name} ombori` },
      });
      for (const p of products) {
        const qty = 10 + Math.floor(Math.random() * 50);
        await this.prisma.stockMovement.create({
          data: {
            tenantId: tenant.id,
            warehouseId: wh.id,
            productId: p.id,
            userId: cashiers[bi].id,
            type: StockMovementType.IN,
            quantity: qty,
            costPrice: p.costPrice,
            note: "Boshlang'ich qoldiq",
          },
        });
      }
    }

    // 7. Shifts + Orders (last 7 days)
    const methods = [PaymentMethod.CASH, PaymentMethod.TERMINAL, PaymentMethod.CLICK, PaymentMethod.PAYME];
    let orderCounter = 1;

    const dayMs = 86_400_000;
    for (let day = 7; day >= 1; day--) {
      for (let bi = 0; bi < 2; bi++) {
        const openedAt = new Date(Date.now() - day * dayMs);
        openedAt.setHours(9, 0, 0, 0);
        const closedAt = new Date(openedAt);
        closedAt.setHours(21, 0, 0, 0);

        const shift = await this.prisma.shift.create({
          data: {
            tenantId: tenant.id,
            userId: cashiers[bi].id,
            branchId: branches[bi].id,
            status: ShiftStatus.CLOSED,
            openedAt,
            closedAt,
            openingCash: 500_000,
            closingCash: 2_000_000 + bi * 500_000,
          },
        });

        const orderCount = 5 + Math.floor(Math.random() * 8);
        for (let oi = 0; oi < orderCount; oi++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const qty = 1 + Math.floor(Math.random() * 3);
          const total = Number(product.sellPrice) * qty;
          const method = methods[Math.floor(Math.random() * methods.length)];

          const order = await this.prisma.order.create({
            data: {
              tenantId: tenant.id,
              shiftId: shift.id,
              userId: cashiers[bi].id,
              branchId: branches[bi].id,
              orderNumber: orderCounter++,
              status: OrderStatus.COMPLETED,
              subtotal: total,
              total,
              createdAt: new Date(openedAt.getTime() + oi * 3_600_000),
            },
          });

          await this.prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: product.id,
              productName: product.name,
              quantity: qty,
              unitPrice: Number(product.sellPrice),
              costPrice: Number(product.costPrice),
              total,
            },
          });

          await this.prisma.paymentIntent.create({
            data: {
              tenantId: tenant.id,
              orderId: order.id,
              method,
              status: PaymentIntentStatus.SETTLED,
              amount: total,
            },
          });
        }
      }
    }

    // 2 open shifts today
    for (let bi = 0; bi < 2; bi++) {
      const openedAt = new Date();
      openedAt.setHours(9, 0, 0, 0);

      const shift = await this.prisma.shift.create({
        data: {
          tenantId: tenant.id,
          userId: cashiers[bi].id,
          branchId: branches[bi].id,
          status: ShiftStatus.OPEN,
          openedAt,
          openingCash: 500_000,
        },
      });

      for (let oi = 0; oi < 3 + bi * 2; oi++) {
        const product = products[oi % products.length];
        const qty = 1 + (oi % 2);
        const total = Number(product.sellPrice) * qty;

        const order = await this.prisma.order.create({
          data: {
            tenantId: tenant.id,
            shiftId: shift.id,
            userId: cashiers[bi].id,
            branchId: branches[bi].id,
            orderNumber: orderCounter++,
            status: OrderStatus.COMPLETED,
            subtotal: total,
            total,
            createdAt: new Date(Date.now() - (3 - oi) * 1_800_000),
          },
        });

        await this.prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            quantity: qty,
            unitPrice: Number(product.sellPrice),
            costPrice: Number(product.costPrice),
            total,
          },
        });

        await this.prisma.paymentIntent.create({
          data: {
            tenantId: tenant.id,
            orderId: order.id,
            method: bi === 0 ? PaymentMethod.CASH : PaymentMethod.TERMINAL,
            status: PaymentIntentStatus.SETTLED,
            amount: total,
          },
        });
      }
    }

    // 8. Customers + Debts
    const customerNames = [
      { name: 'Malika Xasanova',   phone: '+998901234567' },
      { name: 'Dilnoza Karimova',  phone: '+998901234568' },
      { name: 'Feruza Umarova',    phone: '+998901234569' },
      { name: 'Nodira Tojiboyeva', phone: '+998901234570' },
      { name: 'Barno Mirzayeva',   phone: '+998901234571' },
      { name: 'Sherzod Mirzayev',  phone: '+998901234572' },
    ];
    const debtAmounts = [350_000, 890_000, 1_250_000, 540_000, 2_100_000, 780_000];
    const debtDays    = [5, 12, 31, 42, 65, 78];

    for (let i = 0; i < customerNames.length; i++) {
      const customer = await this.prisma.customer.create({
        data: { tenantId: tenant.id, ...customerNames[i] },
      });
      const dueDate = new Date(Date.now() - debtDays[i] * dayMs);
      await this.prisma.debtRecord.create({
        data: {
          tenantId: tenant.id,
          customerId: customer.id,
          totalAmount: debtAmounts[i],
          paidAmount: 0,
          remaining: debtAmounts[i],
          dueDate,
          status: DebtStatus.OVERDUE,
          notes: 'Demo nasiya',
        },
      });
    }

    // 9. Notifications (alerts)
    const alerts = [
      { type: NotificationType.LOW_STOCK,      title: "Kam qoldiq",            body: "Chanel No.5 — faqat 3 dona qoldi (Chilonzor)" },
      { type: NotificationType.LOW_STOCK,      title: "Kam qoldiq",            body: "Versace Eros — faqat 2 dona qoldi (Yunusabad)" },
      { type: NotificationType.ERROR_ALERT,    title: "Sinxronlash xatosi",    body: "Sergeli POS — 2 soatdan beri ulanmadi" },
      { type: NotificationType.NASIYA_OVERDUE, title: "Nasiya muddati o'tdi",  body: "Malika Xasanova — 350,000 so'm, 5 kun" },
      { type: NotificationType.NASIYA_OVERDUE, title: "Nasiya muddati o'tdi",  body: "Barno Mirzayeva — 2,100,000 so'm, 65 kun" },
      { type: NotificationType.LARGE_REFUND,   title: "Katta qaytarish",       body: "Sarvar Qodirov — 1,200,000 so'mlik qaytarish" },
      { type: NotificationType.SYSTEM,         title: "Tizim yangilandi",      body: "RAOS v2.1 — dashboard yangi ko'rinishda" },
      { type: NotificationType.EXPIRY_WARNING, title: "Muddat yaqinlashdi",    body: "L'Oreal Elvive — 15 dona, 30 kun qoldi" },
    ];

    for (const a of alerts) {
      await this.prisma.notification.create({
        data: { tenantId: tenant.id, userId: owner.id, isRead: false, ...a },
      });
    }

    this.logger.log('✅ kosmetika-demo seed complete — owner@kosmetika.uz / Demo1234!');
  }
}
