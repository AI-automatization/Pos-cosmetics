import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

/**
 * /alerts/* — top-level alias for mobile-owner app.
 * Backend serves alerts under /notifications/*, this controller delegates to NotificationsService.
 */
@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get alerts (paginated, filterable)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  getAlerts(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.getNotifications(userId, tenantId, {
      page,
      limit,
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread alerts count' })
  getUnreadCount(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.notificationsService.getUnreadCount(userId, tenantId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark alert as read' })
  @ApiParam({ name: 'id', type: String })
  markAsRead(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.markAsRead(userId, tenantId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all alerts as read' })
  markAllAsRead(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.notificationsService.markAllAsRead(userId, tenantId);
  }
}
