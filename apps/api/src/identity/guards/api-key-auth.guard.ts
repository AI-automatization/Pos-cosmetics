import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiKeyService } from '../api-key.service';

/**
 * T-071: API Key Auth Guard
 * POS offline sync endpointlarida ishlatiladi.
 *
 * Header: X-API-Key: raos_<hex>
 * Scope tekshirish: @RequireScopes('sync:read') decorator bilan
 *
 * Ishlatish:
 *   @UseGuards(ApiKeyAuthGuard)
 *   @ApiSecurity('x-api-key')
 */
@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const rawKey =
      (req.headers['x-api-key'] as string | undefined) ||
      (req.query?.['api_key'] as string | undefined);

    if (!rawKey) {
      throw new UnauthorizedException('X-API-Key header required');
    }

    const apiKey = await this.apiKeyService.validateApiKey(rawKey);

    // Request ga API key ma'lumotlarini qo'shamiz
    (req as Request & { apiKey: typeof apiKey }).apiKey = apiKey;
    (req as Request & { tenantId: string }).tenantId = apiKey.tenantId;

    return true;
  }
}
