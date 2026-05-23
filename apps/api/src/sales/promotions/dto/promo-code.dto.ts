import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PromoType } from '@prisma/client';

export class CreatePromoCodeDto {
  @ApiPropertyOptional({
    description: 'Promo code (auto-generated if empty)',
    example: 'SUMMER25',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @ApiProperty({ enum: PromoType, example: 'PERCENT' })
  @IsEnum(PromoType)
  type!: PromoType;

  @ApiProperty({ description: 'Discount value (% or UZS)', example: 10 })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional({ description: '0 = unlimited', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Minimum purchase amount (UZS)', example: 50000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @ApiProperty({ example: '2026-05-01T00:00:00.000Z' })
  @IsDateString()
  validFrom!: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  validTo?: string;
}

export class UpdatePromoCodeDto extends PartialType(CreatePromoCodeDto) {
  @ApiPropertyOptional({ description: 'Toggle active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ValidateCodeDto {
  @ApiProperty({ example: 'SUMMER25' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'Purchase amount in UZS', example: 150000 })
  @IsNumber()
  @Min(0)
  purchaseAmount!: number;
}
