import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  requestId: string;
  tenantId: string | null;
  userId: string | null;
  ip: string;
}

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run(context: RequestContext, callback: () => void): void {
    this.storage.run(context, callback);
  }

  get(): RequestContext | undefined {
    return this.storage.getStore();
  }

  getRequestId(): string | null {
    return this.get()?.requestId ?? null;
  }

  getTenantId(): string | null {
    return this.get()?.tenantId ?? null;
  }

  getUserId(): string | null {
    return this.get()?.userId ?? null;
  }

  setUser(tenantId: string | null, userId: string | null): void {
    const ctx = this.get();
    if (ctx) {
      ctx.tenantId = tenantId;
      ctx.userId = userId;
    }
  }
}
