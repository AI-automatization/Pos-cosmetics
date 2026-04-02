/**
 * T-130: Product bulk import/export endpoints
 * POST /catalog/products/import  → upload CSV/XLSX, returns {created, updated, errors}
 * GET  /catalog/products/export  → download XLSX or CSV
 */
import {
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProductImportService } from './product-import.service';

@ApiTags('Catalog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/products')
export class ProductImportController {
  constructor(private readonly importService: ProductImportService) {}

  @Post('import')
  @ApiOperation({ summary: 'T-130: Mahsulotlarni CSV/XLSX dan import qilish' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async importProducts(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
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
    return this.importService.importFromBuffer(tenantId, userId, file.buffer, file.mimetype);
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
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename="products-${tenantId}.xlsx"`);
      res.send(buf);
    }
  }
}
