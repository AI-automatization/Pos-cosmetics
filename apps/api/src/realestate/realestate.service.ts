import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RealestateService {
  private readonly logger = new Logger(RealestateService.name);

  constructor(private readonly prisma: PrismaService) {}
}
