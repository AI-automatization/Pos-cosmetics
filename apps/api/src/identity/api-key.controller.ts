import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsNumber, Min, Max } from 'class-validator';
import { CurrentUser } from '../common/decorators';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiKeyService, API_KEY_SCOPES } from './api-key.service';

class CreateApiKeyDto {
  @ApiProperty({ example: 'POS-Branch-1' })
  @IsString()
  name!: string;

  @ApiProperty({ example: ['sync:read', 'sync:write'], required: false })
  @IsOptional()
  @IsArray()
  scopes?: string[];

  @ApiProperty({ example: 'branch-uuid', required: false })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty({ example: 365, required: false, description: 'Expire in N days. Omit for no expiry.' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3650)
  expiresInDays?: number;
}

@ApiTags('Auth')
@Controller('auth')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  // ─── T-071: API KEY MANAGEMENT ────────────────────────────────

  @Post('api-keys')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Yangi API key yaratish (POS sync uchun) (T-071)' })
  @ApiResponse({ status: 201, description: 'API key yaratildi. Key FAQAT SHU SAFAR ko\'rsatiladi!' })
  createApiKey(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.apiKeyService.createApiKey({
      tenantId,
      branchId: dto.branchId,
      name: dto.name,
      scopes: dto.scopes,
      expiresInDays: dto.expiresInDays,
    });
  }

  @Get('api-keys')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'API keylar ro\'yxati' })
  listApiKeys(@CurrentUser('tenantId') tenantId: string) {
    return this.apiKeyService.listApiKeys(tenantId);
  }

  @Get('api-keys/scopes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mavjud API key scope\'lar' })
  getScopes() {
    return { scopes: API_KEY_SCOPES };
  }

  @Delete('api-keys/:id/revoke')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API key ni o\'chirish (revoke)' })
  @ApiParam({ name: 'id', type: String })
  revokeApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.apiKeyService.revokeApiKey(id, tenantId);
  }

  @Delete('api-keys/:id')
  @ApiBearerAuth()
  @Roles('OWNER', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'API key ni butunlay o\'chirish' })
  @ApiParam({ name: 'id', type: String })
  deleteApiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('tenantId') tenantId: string,
  ) {
    return this.apiKeyService.deleteApiKey(id, tenantId);
  }
}
