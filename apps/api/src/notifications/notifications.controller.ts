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
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class RegisterFcmTokenDto {
  @ApiProperty({ example: 'fcm-token-string' })
  @IsString()
  token!: string;

  @ApiProperty({ enum: ['android', 'ios', 'web'], default: 'android' })
  @IsOptional()
  @IsString()
  platform?: string;
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushService: PushService,
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
