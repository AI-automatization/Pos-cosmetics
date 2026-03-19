import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiProperty,
} from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { NotifyService } from './notify.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

class RegisterFcmTokenDto {
  @ApiProperty({ example: 'fcm-token-string' })
  @IsString()
  token!: string;

  @ApiProperty({ enum: ['android', 'ios', 'web'], default: 'android' })
  @IsOptional()
  @IsString()
  platform?: string;
}

class VerifyTelegramDto {
  @ApiProperty({ example: 'abc123def456', description: 'Bot dan olingan token' })
  @IsString()
  token!: string;

  @ApiProperty({ example: '123456789', description: 'Telegram chat ID' })
  @IsString()
  chatId!: string;
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushService: PushService,
    private readonly notifyService: NotifyService,
  ) {}

  // ─── IN-APP NOTIFICATIONS (T-103) ─────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Foydalanuvchi bildirnomalari (sahifalangan)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  getNotifications(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.getNotifications(userId, tenantId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'O\'qilmagan bildirnomalар soni' })
  getUnreadCount(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.notificationsService.getUnreadCount(userId, tenantId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Bildirnomasni o\'qilgan deb belgilash' })
  @ApiParam({ name: 'id', type: String })
  markAsRead(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.markAsRead(userId, tenantId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Barcha bildirnomasni o\'qilgan deb belgilash' })
  markAllAsRead(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.notificationsService.markAllAsRead(userId, tenantId);
  }

  // ─── FCM TOKEN (T-103) ─────────────────────────────────────────

  @Post('fcm-token')
  @ApiOperation({ summary: 'FCM device token ro\'yxatdan o\'tkazish' })
  registerFcmToken(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: RegisterFcmTokenDto,
  ) {
    return this.pushService.registerToken(userId, tenantId, dto.token, dto.platform);
  }

  @Delete('fcm-token/:token')
  @ApiOperation({ summary: 'FCM device token o\'chirish (logout)' })
  @ApiParam({ name: 'token', type: String })
  removeFcmToken(@Param('token') token: string) {
    return this.pushService.removeToken(token);
  }

  // ─── TELEGRAM LINKING (T-122) ─────────────────────────────────

  @Post('telegram/link-token')
  @ApiOperation({
    summary: 'Telegram bog\'lash tokeni yaratish',
    description: 'Qaytarilgan token ni t.me/BotName?start=TOKEN shaklida foydalanuvchiga ko\'rsating',
  })
  async createLinkToken(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    const token = await this.notifyService.createLinkTokenForUser(userId, tenantId);
    const botUsername = process.env['BOT_USERNAME'] ?? 'raos_bot';
    return {
      token,
      link: `https://t.me/${botUsername}?start=${token}`,
      expiresInMinutes: 15,
    };
  }

  @Post('telegram/verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bot tomonidan chatId ni saqlash (webhook uchun)',
    description: 'Bot /start <token> qabul qilganda shu endpointni chaqiradi',
  })
  async verifyTelegramLink(@Body() dto: VerifyTelegramDto) {
    const result = await this.notifyService.verifyLinkToken(dto.token, dto.chatId);
    return result;
  }

  // ─── DEBT REMINDERS ───────────────────────────────────────────

  @Post('run-debt-reminders')
  @ApiOperation({ summary: 'Qarz eslatmalarini ishga tushirish' })
  runDebtReminders(@CurrentUser('tenantId') tenantId: string) {
    return this.notificationsService.runDebtReminders(tenantId);
  }

  @Get('debt-reminders/due-soon')
  @ApiOperation({ summary: 'Muddati yaqin qarzlar (3 kun ichida)' })
  getDueSoon(@CurrentUser('tenantId') tenantId: string) {
    return this.notificationsService.getDueSoonDebts(tenantId);
  }

  @Get('debt-reminders/overdue')
  @ApiOperation({ summary: 'Muddati o\'tgan qarzlar' })
  getOverdue(@CurrentUser('tenantId') tenantId: string) {
    return this.notificationsService.getOverdueDebts(tenantId);
  }

  @Get('reminder-logs')
  @ApiOperation({ summary: 'Yuborilgan eslatmalar tarixi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['DUE_SOON', 'OVERDUE'] })
  getReminderLogs(
    @CurrentUser('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.notificationsService.getReminderLogs(tenantId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      type,
    });
  }
}
