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

// Notification type → mobile priority mapping
const PRIORITY_MAP: Record<string, 'low' | 'medium' | 'high'> = {
  LOW_STOCK: 'medium',
  OUT_OF_STOCK: 'high',
  EXPIRY_WARNING: 'medium',
  LARGE_REFUND: 'high',
  NASIYA_OVERDUE: 'high',
  SHIFT_CHANGED: 'low',
  SALE_COMPLETED: 'low',
  ERROR_ALERT: 'high',
  SYSTEM: 'medium',
};

function toAlert(n: {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  data?: unknown;
}) {
  const d = (n.data ?? {}) as Record<string, unknown>;
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    description: n.body,      // mobile expects "description" not "body"
    body: n.body,
    branchId: (d['branchId'] as string) ?? '',
    branchName: (d['branchName'] as string) ?? '',
    entityId: (d['entityId'] as string) ?? '',
    isRead: n.isRead,
    priority: PRIORITY_MAP[n.type] ?? 'medium',
    createdAt: n.createdAt,
  };
}

/**
 * /alerts/* — top-level alias for mobile-owner app.
 * Transforms Notification shape → mobile Alert shape.
 */
@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get alerts (paginated) — mobile-owner format' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'unread', 'read'] })
  async getAlerts(
    @CurrentUser('userId') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    const unreadOnly = status === 'unread';
    const result = await this.notificationsService.getNotifications(userId, tenantId, {
      page,
      limit,
      unreadOnly,
    });
    return {
      ...result,
      items: result.items.map(toAlert),
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread alerts count — returns { count }' })
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
