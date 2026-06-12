import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsValidBarcode } from '../../common/pipes';

export class CreateVariantDto {
  @ApiProperty({ example: 'Qizil 50ml', description: 'Variant nomi (rang, hajm, tur)' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ example: 'NIV-001-RED-50' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: '8901234567890', description: 'EAN-13, EAN-8, UPC-A or Code128' })
  @IsOptional()
  @IsValidBarcode()
  barcode?: string;

  @ApiPropertyOptional({ example: { color: 'Red', size: 'M' }, description: 'Variant atributlari' })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>;

  @ApiPropertyOptional({ example: 15000, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ enum: ['UZS', 'USD'], default: 'UZS' })
  @IsOptional()
  @IsString()
  costCurrency?: string;

  @ApiPropertyOptional({ example: 20000, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellPrice?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0, description: 'POS da tartib raqami' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class BulkCreateVariantsDto {
  @ApiProperty({ type: [CreateVariantDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants!: CreateVariantDto[];
}

export class GenerateVariantMatrixDto {
  @ApiProperty({
    example: { color: ['Red', 'Blue'], size: ['M', 'L', 'XL'] },
    description: 'Atribut nomlari va qiymatlari — kombinatsiyalar avtomatik yaratiladi',
  })
  @IsObject()
  attributes!: Record<string, string[]>;

  @ApiPropertyOptional({ example: 15000, description: 'Barcha variantlar uchun kelish narxi' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ example: 20000, description: 'Barcha variantlar uchun sotuv narxi' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellPrice?: number;
}

export class UpdateVariantDto {
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

  @ApiPropertyOptional({ example: { color: 'Red', size: 'M' } })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ enum: ['UZS', 'USD'] })
  @IsOptional()
  @IsString()
  costCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
