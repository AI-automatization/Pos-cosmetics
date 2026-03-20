import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateSettingsDto {
  currency?: string;
  language?: string;
  timezone?: string;
  taxRate?: number;
  receiptHeader?: string;
  receiptFooter?: string;
  lowStockThreshold?: number;
  expiryAlertDays?: number;
  extra?: Record<string, unknown>;
}

@Injectable()
export class TenantSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(tenantId: string) {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
    });
    if (!settings) {
      // Return defaults if not yet created
      return {
        currency: 'UZS',
        language: 'uz',
        timezone: 'Asia/Tashkent',
        taxRate: 0,
        receiptHeader: null,
        receiptFooter: null,
        lowStockThreshold: 5,
        expiryAlertDays: 30,
        extra: {},
      };
    }
    return {
      currency: settings.currency,
      language: settings.language,
      timezone: settings.timezone,
      taxRate: Number(settings.taxRate),
      receiptHeader: settings.receiptHeader,
      receiptFooter: settings.receiptFooter,
      lowStockThreshold: settings.lowStockThreshold,
      expiryAlertDays: settings.expiryAlertDays,
      extra: settings.extra,
    };
  }

  async updateSettings(tenantId: string, dto: UpdateSettingsDto) {
    const data: Record<string, unknown> = {};
    if (dto.currency !== undefined) data['currency'] = dto.currency;
    if (dto.language !== undefined) data['language'] = dto.language;
    if (dto.timezone !== undefined) data['timezone'] = dto.timezone;
    if (dto.taxRate !== undefined) data['taxRate'] = dto.taxRate;
    if (dto.receiptHeader !== undefined) data['receiptHeader'] = dto.receiptHeader;
    if (dto.receiptFooter !== undefined) data['receiptFooter'] = dto.receiptFooter;
    if (dto.lowStockThreshold !== undefined) data['lowStockThreshold'] = dto.lowStockThreshold;
    if (dto.expiryAlertDays !== undefined) data['expiryAlertDays'] = dto.expiryAlertDays;
    if (dto.extra !== undefined) data['extra'] = dto.extra;

    const updated = await this.prisma.tenantSettings.upsert({
      where: { tenantId },
      create: { tenantId, ...data } as Parameters<typeof this.prisma.tenantSettings.create>[0]['data'],
      update: data as Parameters<typeof this.prisma.tenantSettings.update>[0]['data'],
    });
    return {
      currency: updated.currency,
      language: updated.language,
      timezone: updated.timezone,
      taxRate: Number(updated.taxRate),
      receiptHeader: updated.receiptHeader,
      receiptFooter: updated.receiptFooter,
      lowStockThreshold: updated.lowStockThreshold,
      expiryAlertDays: updated.expiryAlertDays,
      extra: updated.extra,
    };
  }
}
