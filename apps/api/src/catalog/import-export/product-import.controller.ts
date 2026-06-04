/**
 * #104 (T-130 + async): Product bulk import/export endpoints
 * POST /catalog/products/import        → upload CSV/XLSX; < threshold = sync 200, >= threshold = async 202 + jobId
 * GET  /catalog/products/import/:jobId → async job status + progress + result
 * GET  /catalog/products/import/template → download import template XLSX
 * GET  /catalog/products/export        → download XLSX or CSV
 */
import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ServiceUnavailableException,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProductImportService } from './product-import.service';
import { QueueService } from '../../common/queue/queue.service';

export const IMPORT_SYNC_THRESHOLD = 200;
const IMPORT_MAX_FILE_SIZE = 15 * 1024 * 1024;

@ApiTags('Catalog')
@ApiBearerAuth()
@Controller('catalog/products')
@Roles('OWNER', 'ADMIN', 'MANAGER')
export class ProductImportController {
  private readonly logger = new Logger(ProductImportController.name);

  constructor(
    private readonly importService: ProductImportService,
    private readonly queueService: QueueService,
  ) {}

  @Post('import')
  @ApiOperation({ summary: '#104: Mahsulotlarni CSV/XLSX dan import (sync yoki async)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: IMPORT_MAX_FILE_SIZE } }))
  async importProducts(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!file) throw new BadRequestException('Fayl tanlanmagan');
    const allowedTypes = [
      'text/csv',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Faqat CSV yoki XLSX fayllar qabul qilinadi');
    }

    const rows = await this.importService.parse(file.buffer, file.mimetype);
    if (rows.length === 0) throw new BadRequestException('Faylda mahsulot topilmadi');

    if (rows.length < IMPORT_SYNC_THRESHOLD) {
      const summary = await this.importService.processSync(tenantId, rows);
      res.status(HttpStatus.OK);
      return { mode: 'sync' as const, ...summary };
    }

    try {
      const job = await this.queueService.addProductImportJob({ tenantId, userId, rows });
      res.status(HttpStatus.ACCEPTED);
      return { mode: 'async' as const, jobId: job.id!, total: rows.length };
    } catch (err) {
      this.logger.error(
        `Import enqueue failed tenantId=${tenantId}: ${err instanceof Error ? err.message : String(err)}`,
      );
      // Redis down — do NOT silently run thousands of rows synchronously.
      throw new ServiceUnavailableException(
        "Import xizmati vaqtincha ishlamayapti; kichikroq fayl bilan urinib ko'ring.",
      );
    }
  }

  // IMPORTANT: declare import/template BEFORE import/:jobId — Nest matches in declaration order
  @Get('import/template')
  @ApiOperation({ summary: 'Download import template XLSX' })
  async downloadTemplate(@Res() res: Response) {
    const buf = await this.importService.generateTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="RAOS-import-template.xlsx"');
    res.send(buf);
  }

  @Get('import/:jobId')
  @ApiOperation({ summary: '#104: Async import jobi holati + progress' })
  async importStatus(@Param('jobId') jobId: string) {
    return this.queueService.getProductImportJobStatus(jobId);
  }

  @Get('export')
  @ApiOperation({ summary: 'T-130: Mahsulotlarni XLSX/CSV ga eksport qilish' })
  @ApiQuery({ name: 'format', required: false, enum: ['xlsx', 'csv'], description: 'Default: xlsx' })
  async exportProducts(
    @CurrentUser('tenantId') tenantId: string,
    @Query('format') format: string = 'xlsx',
    @Res() res: Response,
  ) {
    if (format === 'csv') {
      const csv = await this.importService.exportToCsv(tenantId);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="products-${tenantId}.csv"`);
      res.send(csv);
    } else {
      const buf = await this.importService.exportToXlsx(tenantId);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="products-${tenantId}.xlsx"`);
      res.send(buf);
    }
  }
}
