/**
 * SalesService — facade delegating to ShiftService, OrderService, ReturnService.
 * Controllers continue to inject this single entry-point (backward compatible).
 * SRP is maintained: each sub-service has one responsibility.
 */
import { Injectable } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { OrderService } from './order.service';
import { ReturnService } from './return.service';
import { OpenShiftDto, CloseShiftDto, CreateOrderDto, CreateReturnDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(
    private readonly shifts: ShiftService,
    private readonly orders: OrderService,
    private readonly returns: ReturnService,
  ) {}

  // ─── SHIFTS ───────────────────────────────────────────────────
  openShift(tenantId: string, userId: string, dto: OpenShiftDto) {
    return this.shifts.openShift(tenantId, userId, dto);
  }

  closeShift(tenantId: string, userId: string, shiftId: string, dto: CloseShiftDto) {
    return this.shifts.closeShift(tenantId, userId, shiftId, dto);
  }

  getShiftAvailableCash(tenantId: string, shiftId: string) {
    return this.shifts.getShiftAvailableCash(tenantId, shiftId);
  }

  getCurrentShift(tenantId: string, userId: string) {
    return this.shifts.getCurrentShift(tenantId, userId);
  }

  getActiveShifts(tenantId: string, branchId?: string) {
    return this.shifts.getActiveShifts(tenantId, branchId);
  }

  getShifts(
    tenantId: string,
    limit?: number,
    page?: number,
    opts?: { branchId?: string; status?: string; userId?: string; role?: string },
  ) {
    return this.shifts.getShifts(tenantId, limit, page, opts);
  }

  getShiftById(tenantId: string, shiftId: string) {
    return this.shifts.getShiftById(tenantId, shiftId);
  }

  getShiftSummary(tenantId: string, opts: { branchId?: string; fromDate?: string; toDate?: string }) {
    return this.shifts.getShiftSummary(tenantId, opts);
  }

  // ─── ORDERS ───────────────────────────────────────────────────
  createOrder(tenantId: string, userId: string, dto: CreateOrderDto, userRole?: UserRole) {
    return this.orders.createOrder(tenantId, userId, dto, userRole);
  }

  getQuickStats(tenantId: string, branchId?: string) {
    return this.orders.getQuickStats(tenantId, branchId);
  }

  getOrders(tenantId: string, opts: { page?: number; limit?: number; shiftId?: string }) {
    return this.orders.getOrders(tenantId, opts);
  }

  getOrderById(tenantId: string, id: string) {
    return this.orders.getOrderById(tenantId, id);
  }

  getOrderByNumber(tenantId: string, orderNumber: number) {
    return this.orders.getOrderByNumber(tenantId, orderNumber);
  }

  getReceipt(tenantId: string, orderId: string) {
    return this.orders.getReceipt(tenantId, orderId);
  }

  // ─── RETURNS ──────────────────────────────────────────────────
  createReturn(tenantId: string, userId: string, dto: CreateReturnDto) {
    return this.returns.createReturn(tenantId, userId, dto);
  }

  approveReturn(tenantId: string, approvedBy: string, returnId: string) {
    return this.returns.approveReturn(tenantId, approvedBy, returnId);
  }

  listReturns(tenantId: string, query: { page?: number; limit?: number; status?: string }) {
    return this.returns.listReturns(tenantId, query);
  }
}
