import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureFlagsService } from './feature-flags.service';

export const FEATURE_FLAG_KEY = 'feature_flag';

/**
 * Decorator that guards a route behind a feature flag.
 * @example @FeatureFlag('loyalty')
 */
export function FeatureFlag(flagKey: string) {
  return applyDecorators(
    SetMetadata(FEATURE_FLAG_KEY, flagKey),
    UseGuards(FeatureFlagGuard),
  );
}

@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly flagsService: FeatureFlagsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const flagKey = this.reflector.getAllAndOverride<string>(FEATURE_FLAG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!flagKey) return true;

    const request = context.switchToHttp().getRequest<{ user?: { tenantId?: string } }>();
    const tenantId = request.user?.tenantId ?? '';
    if (!tenantId) return false;

    const enabled = await this.flagsService.isEnabled(flagKey, tenantId);
    if (!enabled) {
      throw new ForbiddenException(`Feature '${flagKey}' is not enabled for this tenant`);
    }

    return true;
  }
}
