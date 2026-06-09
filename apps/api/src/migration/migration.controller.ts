import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MigrationService } from './migration.service';
import { QueueService } from '../common/queue/queue.service';
import { StartMigrationDto, ValidateCredentialsDto } from './dto/start-migration.dto';

@ApiTags('Migration')
@Controller('migration')
export class MigrationController {
  private readonly logger = new Logger(MigrationController.name);

  constructor(
    private readonly migrationService: MigrationService,
    private readonly queueService: QueueService,
  ) {}

  @Get('providers')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'List available migration providers' })
  getProviders() {
    return { data: this.migrationService.getAvailableProviders() };
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Validate credentials for a migration provider' })
  async validateCredentials(@Body() dto: ValidateCredentialsDto) {
    const valid = await this.migrationService.validateCredentials(
      dto.provider,
      dto.credentials as unknown as Record<string, string>,
    );
    return { data: { valid } };
  }

  @Post('start')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Start data migration from external system' })
  async startMigration(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: StartMigrationDto,
  ) {
    this.logger.log(`Migration requested: provider=${dto.provider} tenant=${tenantId}`);

    // Validate first
    const valid = await this.migrationService.validateCredentials(
      dto.provider,
      dto.credentials as unknown as Record<string, string>,
    );

    if (!valid) {
      return {
        data: null,
        error: 'Invalid credentials. Check your API key or Secret Key.',
      };
    }

    // Add to queue for async processing
    const job = await this.queueService.addMigrationJob({
      tenantId,
      provider: dto.provider,
      credentials: dto.credentials as unknown as Record<string, string>,
    });

    return {
      data: {
        jobId: job.id,
        provider: dto.provider,
        status: 'processing',
        message: 'Migration started. Track progress via GET /migration/status/:jobId',
      },
    };
  }

  @Post('start/sync')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Run migration synchronously (small datasets)' })
  async startMigrationSync(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: StartMigrationDto,
  ) {
    this.logger.log(`Sync migration requested: provider=${dto.provider} tenant=${tenantId}`);

    const summary = await this.migrationService.runMigration(
      tenantId,
      dto.provider,
      dto.credentials as unknown as Record<string, string>,
    );

    return { data: summary };
  }

  @Get('status/:jobId')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Get migration job status' })
  async getMigrationStatus(@CurrentUser() _user: unknown) {
    // Job status is tracked via queue service
    // This is a placeholder — real implementation uses queueService.getMigrationJobStatus()
    return { data: { status: 'check queue service' } };
  }
}
