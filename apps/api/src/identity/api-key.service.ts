import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, createHash } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

export const API_KEY_SCOPES = [
  'sync:read',
  'sync:write',
  'catalog:read',
  'inventory:read',
  'sales:write',
] as const;

export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Yangi API key yaratish */
  async createApiKey(params: {
    tenantId: string;
    branchId?: string;
    name: string;
    scopes?: string[];
    expiresInDays?: number;
  }): Promise<{ id: string; key: string; name: string; scopes: string[] }> {
    const rawKey = `raos_${randomBytes(32).toString('hex')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');

    const expiresAt = params.expiresInDays
      ? new Date(Date.now() + params.expiresInDays * 86400_000)
      : null;

    const apiKey = await this.prisma.apiKey.create({
      data: {
        tenantId: params.tenantId,
        branchId: params.branchId ?? null,
        keyHash,
        name: params.name,
        scopes: params.scopes ?? ['sync:read', 'sync:write'],
        expiresAt,
      },
      select: { id: true, name: true, scopes: true },
    });

    this.logger.log(
      `[ApiKey] Created: name="${params.name}" tenant=${params.tenantId}`,
    );

    // RAW key faqat bir marta qaytariladi — DB da saqlanmaydi
    return { ...apiKey, key: rawKey };
  }

  /** API key orqali autentifikatsiya */
  async validateApiKey(rawKey: string) {
    const keyHash = createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await this.prisma.apiKey.findFirst({
      where: { keyHash, isActive: true },
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new UnauthorizedException('API key expired');
    }

    // lastUsed ni yangilash (fire-and-forget)
    this.prisma.apiKey
      .update({
        where: { id: apiKey.id },
        data: { lastUsed: new Date() },
      })
      .catch(() => null);

    return apiKey;
  }

  /** Tenant dagi API keylarni ro'yxat */
  async listApiKeys(tenantId: string) {
    return this.prisma.apiKey.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        scopes: true,
        branchId: true,
        isActive: true,
        lastUsed: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** API key ni o'chirish (revoke) */
  async revokeApiKey(id: string, tenantId: string): Promise<void> {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, tenantId },
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.warn(`[ApiKey] Revoked: id=${id} tenant=${tenantId}`);
  }

  /** API key ni butunlay o'chirish */
  async deleteApiKey(id: string, tenantId: string): Promise<void> {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, tenantId },
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.apiKey.delete({ where: { id } });
    this.logger.warn(`[ApiKey] Deleted: id=${id} tenant=${tenantId}`);
  }
}
