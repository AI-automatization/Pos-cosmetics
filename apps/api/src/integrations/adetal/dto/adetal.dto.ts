import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdetalConfigUpdateDto {
  @ApiPropertyOptional({ description: 'Adetal account phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Adetal account password' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'Enable/disable integration' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdetalStoreCreateDto {
  @ApiProperty({ description: 'Store name (max 100)' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Store description (max 500)' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @ApiPropertyOptional({ description: 'Address text' })
  @IsOptional()
  @IsString()
  locationAddress?: string;
}

export class AdetalProductCreateDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Price in UZS' })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ description: 'Category name' })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ description: 'Description (max 2000)' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Stock quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}

export class AdetalOrderStatusUpdateDto {
  @ApiProperty({ description: 'Adetal order ID (MongoDB ObjectId)' })
  @IsString()
  orderId!: string;

  @ApiProperty({ description: 'New status: CONFIRMED | SHIPPED | DELIVERED | CANCELLED' })
  @IsString()
  status!: string;
}

export class AdetalPaymentReviewDto {
  @ApiProperty({ description: 'Adetal order ID (MongoDB ObjectId)' })
  @IsString()
  orderId!: string;

  @ApiProperty({ description: 'Approve or reject payment' })
  @IsBoolean()
  approved!: boolean;
}

export class AdetalStoreUpdateDto {
  @ApiPropertyOptional({ description: 'Store description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Telegram handle' })
  @IsOptional()
  @IsString()
  telegram?: string;

  @ApiPropertyOptional({ description: 'Instagram handle' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ description: 'WhatsApp number' })
  @IsOptional()
  @IsString()
  whatsapp?: string;
}

export class AdetalLocationUpdateDto {
  @ApiProperty({ description: 'Latitude' })
  @IsNumber()
  lat!: number;

  @ApiProperty({ description: 'Longitude' })
  @IsNumber()
  lng!: number;

  @ApiPropertyOptional({ description: 'Address text' })
  @IsOptional()
  @IsString()
  address?: string;
}

/** Adetal integration config shape stored in IntegrationConfig.config JSON */
export interface AdetalIntegrationConfig {
  phone: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
  storeId: string;
  productMappings: Record<string, string>;
  reverseProductMappings: Record<string, string>;
  lastPolledAt: string;
}
