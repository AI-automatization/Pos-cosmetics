import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../common/queue/queue.service';
import { SmsService } from './sms.service';

@Injectable()
export class SmsCampaignService {
  private readonly logger = new Logger(SmsCampaignService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
    private readonly smsService: SmsService,
  ) {}

  async create(tenantId: string, userId: string, name: string, content: string, phones: string[]) {
    const campaign = await this.prisma.smsCampaign.create({
      data: {
        tenantId,
        name,
        content,
        status: 'DRAFT',
        totalRecipients: phones.length,
        createdBy: userId,
      },
    });

    // Create SmsMessage records for each recipient
    await this.prisma.smsMessage.createMany({
      data: phones.map((phone) => ({
        tenantId,
        campaignId: campaign.id,
        phone,
        content,
        status: 'PENDING' as const,
      })),
    });

    this.logger.log(`Campaign created: id=${campaign.id} tenant=${tenantId} recipients=${phones.length}`);
    return campaign;
  }

  async schedule(tenantId: string, campaignId: string, scheduledAt: Date) {
    const campaign = await this.getCampaign(tenantId, campaignId);
    if (campaign.status !== 'DRAFT') {
      throw new BadRequestException(`Campaign "${campaign.name}" is not in DRAFT status`);
    }

    const delay = scheduledAt.getTime() - Date.now();
    if (delay < 0) throw new BadRequestException('Scheduled time must be in the future');

    await this.prisma.smsCampaign.update({
      where: { id: campaignId },
      data: { status: 'SCHEDULED', scheduledAt },
    });

    await this.queueService.addSmsCampaignJob(
      { tenantId, campaignId },
      { delay },
    );

    this.logger.log(`Campaign scheduled: id=${campaignId} at=${scheduledAt.toISOString()}`);
    return this.getCampaign(tenantId, campaignId);
  }

  async sendNow(tenantId: string, campaignId: string) {
    const campaign = await this.getCampaign(tenantId, campaignId);
    if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
      throw new BadRequestException(`Campaign "${campaign.name}" cannot be sent (status: ${campaign.status})`);
    }

    await this.prisma.smsCampaign.update({
      where: { id: campaignId },
      data: { status: 'SCHEDULED' },
    });

    await this.queueService.addSmsCampaignJob({ tenantId, campaignId });

    this.logger.log(`Campaign queued for immediate send: id=${campaignId}`);
    return this.getCampaign(tenantId, campaignId);
  }

  async processCampaign(tenantId: string, campaignId: string) {
    await this.prisma.smsCampaign.update({
      where: { id: campaignId },
      data: { status: 'SENDING', sentAt: new Date() },
    });

    const { sent, failed } = await this.smsService.sendBulkForCampaign(tenantId, campaignId);

    // Aggregate cost
    const costAgg = await this.prisma.smsMessage.aggregate({
      where: { campaignId },
      _sum: { costInTiyin: true },
    });

    await this.prisma.smsCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        totalSent: sent,
        totalFailed: failed,
        totalCost: costAgg._sum.costInTiyin ?? 0,
      },
    });

    this.logger.log(`Campaign completed: id=${campaignId} sent=${sent} failed=${failed}`);
  }

  async cancel(tenantId: string, campaignId: string) {
    const campaign = await this.getCampaign(tenantId, campaignId);
    if (campaign.status === 'COMPLETED' || campaign.status === 'SENDING') {
      throw new BadRequestException('Cannot cancel a campaign that is already sending or completed');
    }

    return this.prisma.smsCampaign.update({
      where: { id: campaignId },
      data: { status: 'CANCELLED' },
    });
  }

  async list(tenantId: string) {
    return this.prisma.smsCampaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getCampaign(tenantId: string, campaignId: string) {
    const campaign = await this.prisma.smsCampaign.findFirst({
      where: { id: campaignId, tenantId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async getCampaignMessages(tenantId: string, campaignId: string) {
    return this.prisma.smsMessage.findMany({
      where: { campaignId, tenantId },
      orderBy: { createdAt: 'asc' },
      take: 500,
    });
  }
}
