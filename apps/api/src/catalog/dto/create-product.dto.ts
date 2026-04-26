import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';
import { IsValidBarcode } from '../../common/pipes';

export class CreateProductDto {
  @ApiProperty({ example: 'Nivea Krem 100ml' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ example: 'NIV-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: '8901234567890', description: 'EAN-13, EAN-8, UPC-A or Code128' })
  @IsOptional()
  @IsValidBarcode()
  barcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  unitId?: string;

  @ApiProperty({ example: 15000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice!: number;

  @ApiProperty({ example: 20000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellPrice!: number;

  @ApiPropertyOptional({ example: 5, description: 'Minimum stock level' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  expiryTracking?: boolean;

  @ApiPropertyOptional({
    enum: ['UZS', 'USD'],
    default: 'UZS',
    description: 'T-082: Narx valyutasi (UZS yoki USD)',
  })
  @IsOptional()
  @IsString()
  costCurrency?: string;

  @ApiPropertyOptional({ type: [String], description: 'Extra barcodes' })
  @IsOptional()
  @IsString({ each: true })
  extraBarcodes?: string[];

  @ApiPropertyOptional({ description: 'Link product to supplier on create' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ example: 10, description: 'Initial stock quantity (creates IN movement)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  initialStock?: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'EAN-13, EAN-8, UPC-A or Code128' })
  @IsOptional()
  @IsValidBarcode()
  barcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  unitId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  expiryTracking?: boolean;

  @ApiPropertyOptional({ enum: ['UZS', 'USD'] })
  @IsOptional()
  @IsString()
  costCurrency?: string;

  @ApiPropertyOptional({ type: [String], description: 'Extra barcodes' })
  @IsOptional()
  @IsString({ each: true })
  extraBarcodes?: string[];
}

export class ProductFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc';
}
