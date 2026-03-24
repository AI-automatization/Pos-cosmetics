/**
 * T-129: File Upload Controller
 * POST /upload          → single file
 * POST /upload/bulk     → multiple files (max 10)
 * GET  /upload/presign  → presigned URL for direct download
 * DELETE /upload        → delete by key
 */
import {
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../identity/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({ summary: 'T-129: Upload single file (max 10 MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'products' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadSingle(
    @CurrentUser('tenantId') tenantId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) throw new BadRequestException('Fayl tanlanmagan');
    return this.uploadService.uploadOne(tenantId, file, folder ?? 'uploads');
  }

  @Post('bulk')
  @ApiOperation({ summary: 'T-129: Upload multiple files (max 10 files, 10 MB each)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        folder: { type: 'string', example: 'products' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10, { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadBulk(
    @CurrentUser('tenantId') tenantId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ) {
    if (!files?.length) throw new BadRequestException('Fayllar tanlanmagan');
    return this.uploadService.uploadMany(tenantId, files, folder ?? 'uploads');
  }

  @Get('presign')
  @ApiOperation({ summary: 'T-129: Get presigned URL for file download' })
  @ApiQuery({ name: 'key', description: 'Storage key returned from upload endpoint' })
  @ApiQuery({ name: 'expiresIn', required: false, type: Number, description: 'Seconds (default 3600)' })
  presign(
    @Query('key') key: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    if (!key) throw new BadRequestException('key majburiy');
    return this.uploadService.presignGet(key, expiresIn ? parseInt(expiresIn, 10) : 3600);
  }

  @Delete()
  @ApiOperation({ summary: 'T-129: Delete uploaded file by key' })
  async deleteFile(@Body('key') key: string) {
    if (!key) throw new BadRequestException('key majburiy');
    await this.uploadService.deleteOne(key);
    return { success: true };
  }
}
