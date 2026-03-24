import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { IpBlockService } from '../cache/ip-block.service';

@Injectable()
export class IpBlockMiddleware implements NestMiddleware {
  constructor(private readonly ipBlockService: IpBlockService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      '';

    const blocked = await this.ipBlockService.isBlocked(ip);
    if (blocked) {
      res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Your IP address has been blocked. Contact support.',
        error: 'Forbidden',
      });
      return;
    }

    next();
  }
}
