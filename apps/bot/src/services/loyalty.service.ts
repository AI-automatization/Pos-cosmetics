// T-466: Loyalty Telegram Bot — ball so'rash va tarix ko'rish

import prisma from '../prisma';

interface LoyaltyInfo {
  customerName: string;
  phone: string;
  points: number;
  moneyValue: number;
  redeemRate: number;
}

interface LoyaltyTx {
  type: string;
  points: number;
  note: string | null;
  createdAt: Date;
}

/**
 * Telefon raqami orqali mijoz loyalty ma'lumotini olish
 */
export async function getLoyaltyByPhone(
  tenantId: string,
  phone: string,
): Promise<LoyaltyInfo | null> {
  // Normalize phone: +998... or 998... or 90...
  const normalized = phone.replace(/[^\d]/g, '');
  const searchPhone = normalized.startsWith('998')
    ? `+${normalized}`
    : normalized.length === 9
      ? `+998${normalized}`
      : `+${normalized}`;

  const customer = await prisma.customer.findFirst({
    where: { tenantId, phone: { contains: normalized.slice(-9) } },
    select: { id: true, name: true, phone: true },
  });

  if (!customer) return null;

  const config = await prisma.loyaltyConfig.findUnique({
    where: { tenantId },
  });
  if (!config?.isActive) return null;

  const account = await prisma.loyaltyAccount.findUnique({
    where: { customerId: customer.id },
  });

  const points = account?.points ?? 0;
  const redeemRate = Number(config.redeemRate);

  return {
    customerName: customer.name,
    phone: customer.phone ?? searchPhone,
    points,
    moneyValue: points * redeemRate,
    redeemRate,
  };
}

/**
 * Telefon raqami orqali oxirgi 10 ta loyalty tranzaksiyalarni olish
 */
export async function getLoyaltyHistory(
  tenantId: string,
  phone: string,
): Promise<{ customer: string; transactions: LoyaltyTx[] } | null> {
  const normalized = phone.replace(/[^\d]/g, '');
  const customer = await prisma.customer.findFirst({
    where: { tenantId, phone: { contains: normalized.slice(-9) } },
    select: { id: true, name: true },
  });

  if (!customer) return null;

  const account = await prisma.loyaltyAccount.findUnique({
    where: { customerId: customer.id },
  });
  if (!account) return { customer: customer.name, transactions: [] };

  const transactions = await prisma.loyaltyTransaction.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { type: true, points: true, note: true, createdAt: true },
  });

  return { customer: customer.name, transactions };
}

/**
 * Tenant uchun loyalty statistika (bot admin uchun)
 */
export async function getLoyaltyStats(tenantId: string) {
  const config = await prisma.loyaltyConfig.findUnique({ where: { tenantId } });
  if (!config?.isActive) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalAccounts, totalPoints, todayEarned, todayRedeemed] = await Promise.all([
    prisma.loyaltyAccount.count({ where: { tenantId, points: { gt: 0 } } }),
    prisma.loyaltyAccount.aggregate({ where: { tenantId }, _sum: { points: true } }),
    prisma.loyaltyTransaction.aggregate({
      where: { tenantId, type: 'EARN', createdAt: { gte: today } },
      _sum: { points: true },
    }),
    prisma.loyaltyTransaction.aggregate({
      where: { tenantId, type: 'REDEEM', createdAt: { gte: today } },
      _sum: { points: true },
    }),
  ]);

  return {
    activeCustomers: totalAccounts,
    totalPoints: totalPoints._sum.points ?? 0,
    todayEarned: todayEarned._sum.points ?? 0,
    todayRedeemed: Math.abs(todayRedeemed._sum.points ?? 0),
    redeemRate: Number(config.redeemRate),
  };
}
