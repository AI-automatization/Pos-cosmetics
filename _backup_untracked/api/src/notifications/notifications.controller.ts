import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('alerts')
  @ApiOperation({ summary: 'Get alerts/notifications' })
  getAlerts(@Query('branchId') branchId?: string) {
    return this.notificationsService.getAlerts(branchId);
  }

  @Patch('alerts/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark alert as read' })
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('register-device')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register push notification device token' })
  registerDevice(
    @CurrentUser('userId') userId: string,
    @Body() body: { token: string; platform: string },
  ) {
    return this.notificationsService.registerDevice(userId, body.token, body.platform);
  }
}
