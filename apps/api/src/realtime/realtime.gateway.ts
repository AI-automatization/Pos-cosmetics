import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { OnEvent } from '@nestjs/event-emitter';

// ─── Supported real-time event types ───────────────────────────────────────
export const RT_EVENTS = {
  SALE_COMPLETED: 'sale:completed',
  SHIFT_CHANGED: 'shift:changed',
  SYNC_STATUS: 'sync:status',
  ERROR_NEW: 'error:new',
} as const;

@WebSocketGateway({
  cors: { origin: '*' },   // Production da env dan o'qiladi
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  // ─── Connection lifecycle ───────────────────────────────────────────────

  async handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ??
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      this.logger.warn(`WS rejected: no token [${client.id}]`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<{
        sub: string;
        tenantId: string | null;
        isAdmin?: boolean;
      }>(token);

      // Metadatani socket ga yozamiz
      const c = client as typeof client & { userId: string; tenantId: string | null; isAdmin: boolean };
      c.userId = payload.sub;
      c.tenantId = payload.tenantId;
      c.isAdmin = payload.isAdmin ?? false;

      // Room qo'shish: tenant room yoki admin room
      if (payload.isAdmin) {
        await client.join('room:admin');
        this.logger.log(`Admin connected [${client.id}]`);
      } else if (payload.tenantId) {
        await client.join(`room:tenant:${payload.tenantId}`);
        this.logger.log(`Tenant connected tenantId=${payload.tenantId} [${client.id}]`);
      } else {
        client.disconnect();
      }
    } catch {
      this.logger.warn(`WS rejected: invalid token [${client.id}]`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected [${client.id}]`);
  }

  // ─── Client → Server messages ───────────────────────────────────────────

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { time: Date.now() });
  }

  // ─── Server → Client: domain event listeners ────────────────────────────

  /**
   * sale.created event → tenant room + admin room
   */
  @OnEvent('sale.created')
  onSaleCreated(payload: { tenantId: string; orderId: string; total: number }) {
    this.server
      .to(`room:tenant:${payload.tenantId}`)
      .to('room:admin')
      .emit(RT_EVENTS.SALE_COMPLETED, payload);
  }

  /**
   * shift.changed event (open/close)
   */
  @OnEvent('shift.changed')
  onShiftChanged(payload: { tenantId: string; shiftId: string; status: string; userId: string }) {
    this.server
      .to(`room:tenant:${payload.tenantId}`)
      .to('room:admin')
      .emit(RT_EVENTS.SHIFT_CHANGED, payload);
  }

  /**
   * sync.status event (POS offline/online)
   */
  @OnEvent('sync.status')
  onSyncStatus(payload: { tenantId: string; deviceId: string; status: string }) {
    this.server
      .to(`room:tenant:${payload.tenantId}`)
      .emit(RT_EVENTS.SYNC_STATUS, payload);
  }

  // ─── Public emit helper (boshqa service lardan chaqirish uchun) ──────────

  emitToTenant(tenantId: string, event: string, data: unknown) {
    this.server.to(`room:tenant:${tenantId}`).emit(event, data);
  }

  emitToAdmin(event: string, data: unknown) {
    this.server.to('room:admin').emit(event, data);
  }
}
