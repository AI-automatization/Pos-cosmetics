import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SMS_GATEWAY, type SmsGateway, type SmsBalanceResult } from './interfaces/sms-gateway.interface';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(SMS_GATEWAY) private readonly gateway: SmsGateway,
  ) {}

  async sendSingle(tenantId: string, phone: string, text: string): Promise<{ success: boolean; messageId?: string }> {
    const isUnsubscribed = await this.isUnsubscribed(tenantId, phone);
    if (isUnsubscribed) {
      this.logger.warn(`SMS blocked — unsubscribed: tenant=${tenantId} phone=${phone}`);
      await this.prisma.smsMessage.create({
        data: { tenantId, phone, content: text, status: 'UNSUBSCRIBED' },
      });
      return { success: false };
    }

    const msg = await this.prisma.smsMessage.create({
      data: { tenantId, phone, content: text, status: 'QUEUED' },
    });

    const result = await this.gateway.send(phone, text);

    await this.prisma.smsMessage.update({
      where: { id: msg.id },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        providerMessageId: result.providerMessageId,
        costInTiyin: result.costInTiyin ?? 0,
        errorMessage: result.errorMessage,
        sentAt: result.success ? new Date() : undefined,
      },
    });

    if (result.success) {
      this.logger.log(`SMS sent: tenant=${tenantId} phone=${phone}`);
    } else {
      this.logger.warn(`SMS failed: tenant=${tenantId} phone=${phone} error=${result.errorMessage}`);
    }

    return { success: result.success, messageId: msg.id };
  }

  async sendBulkForCampaign(tenantId: string, campaignId: string): Promise<{ sent: number; failed: number }> {
    const PAGE_SIZE = 100;
    let sent = 0;
    let failed = 0;
    let skip = 0;

    while (true) {
      const messages = await this.prisma.smsMessage.findMany({
        where: { campaignId, status: 'PENDING' },
        take: PAGE_SIZE,
        skip,
        orderBy: { createdAt: 'asc' },
      });

      if (messages.length === 0) break;

      for (const msg of messages) {
        const isUnsubscribed = await this.isUnsubscribed(tenantId, msg.phone);
        if (isUnsubscribed) {
          await this.prisma.smsMessage.update({
            where: { id: msg.id },
            data: { status: 'UNSUBSCRIBED' },
          });
          failed++;
          continue;
        }

        const result = await this.gateway.send(msg.phone, msg.content);

        await this.prisma.smsMessage.update({
          where: { id: msg.id },
          data: {
            status: result.success ? 'SENT' : 'FAILED',
            providerMessageId: result.providerMessageId,
            costInTiyin: result.costInTiyin ?? 0,
            errorMessage: result.errorMessage,
            sentAt: result.success ? new Date() : undefined,
          },
        });

        if (result.success) sent++;
        else failed++;
      }

      // Don't increment skip — we're consuming PENDING rows
      if (messages.length < PAGE_SIZE) break;
    }

    return { sent, failed };
  }

  async getBalance(): Promise<SmsBalanceResult> {
    return this.gateway.getBalance();
  }

  async unsubscribe(tenantId: string, phone: string): Promise<void> {
    await this.prisma.smsUnsubscribe.upsert({
      where: { tenantId_phone: { tenantId, phone } },
      create: { tenantId, phone },
      update: {},
    });
    this.logger.log(`SMS unsubscribe: tenant=${tenantId} phone=${phone}`);
  }

  private async isUnsubscribed(tenantId: string, phone: string): Promise<boolean> {
    const record = await this.prisma.smsUnsubscribe.findUnique({
      where: { tenantId_phone: { tenantId, phone } },
    });
    return !!record;
  }
}
