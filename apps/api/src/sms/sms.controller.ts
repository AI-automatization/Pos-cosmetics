import { Controller, Get, Post, Patch, Delete, Param, Body, Headers, Logger, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators';
import { SmsService } from './sms.service';
import { SmsCampaignService } from './sms-campaign.service';
import { SendSmsDto, CreateCampaignDto, ScheduleCampaignDto, UnsubscribeDto } from './dto/send-sms.dto';

@ApiTags('SMS')
@ApiBearerAuth()
@Controller('sms')
@Roles('OWNER', 'ADMIN', 'MANAGER')
export class SmsController {
  private readonly logger = new Logger(SmsController.name);

  constructor(
    private readonly smsService: SmsService,
    private readonly campaignService: SmsCampaignService,
    private readonly config: ConfigService,
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Bitta SMS yuborish' })
  sendSingle(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: SendSmsDto,
  ) {
    return this.smsService.sendSingle(tenantId, dto.phone, dto.text);
  }

  @Get('balance')
  @ApiOperation({ summary: 'SMS provayderdan balans olish' })
  getBalance() {
    return this.smsService.getBalance();
  }

  // ─── Campaigns ──────────────────────────────────────────────────

  @Get('campaigns')
  @ApiOperation({ summary: 'Kampaniyalar ro\'yxati' })
  listCampaigns(@CurrentUser('tenantId') tenantId: string) {
    return this.campaignService.list(tenantId);
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Yangi kampaniya yaratish (DRAFT)' })
  createCampaign(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignService.create(tenantId, userId, dto.name, dto.content, dto.phones);
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Kampaniya ma\'lumotlari' })
  getCampaign(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.campaignService.getCampaign(tenantId, id);
  }

  @Get('campaigns/:id/messages')
  @ApiOperation({ summary: 'Kampaniya xabarlari ro\'yxati' })
  getCampaignMessages(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.campaignService.getCampaignMessages(tenantId, id);
  }

  @Patch('campaigns/:id/schedule')
  @ApiOperation({ summary: 'Kampaniyani rejalashtirish' })
  scheduleCampaign(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: ScheduleCampaignDto,
  ) {
    return this.campaignService.schedule(tenantId, id, new Date(dto.scheduledAt));
  }

  @Post('campaigns/:id/send')
  @ApiOperation({ summary: 'Kampaniyani hozir yuborish' })
  sendCampaign(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.campaignService.sendNow(tenantId, id);
  }

  @Delete('campaigns/:id')
  @ApiOperation({ summary: 'Kampaniyani bekor qilish' })
  cancelCampaign(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.campaignService.cancel(tenantId, id);
  }

  // ─── Unsubscribe (public webhook) ──────────────────────────────

  @Public()
  @Post('unsubscribe')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'STOP — SMS obunasini bekor qilish (webhook secret kerak)' })
  unsubscribe(
    @Body() dto: UnsubscribeDto,
    @Headers('x-webhook-secret') webhookSecret: string,
  ) {
    const expected = this.config.get<string>('SMS_WEBHOOK_SECRET', '');
    if (!expected || webhookSecret !== expected) {
      throw new ForbiddenException('Invalid webhook secret');
    }
    if (!dto.tenantId) {
      this.logger.warn(`SMS unsubscribe without tenantId: phone=${dto.phone}`);
      return { success: false, error: 'tenantId required' };
    }
    return this.smsService.unsubscribe(dto.tenantId, dto.phone).then(() => ({ success: true }));
  }
}
