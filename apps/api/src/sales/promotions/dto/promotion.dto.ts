import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { PromotionType } from '@prisma/client';

export class CreatePromotionDto {
  @ApiProperty({ example: '3ta olsang 1ta bepul' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: PromotionType, example: 'BUY_X_GET_Y' })
  @IsEnum(PromotionType)
  type!: PromotionType;

  @ApiProperty({
    description: 'PERCENT: {percent:10} | FIXED: {amount:5000} | BUY_X_GET_Y: {buyQty:2,getQty:1} | BUNDLE: {productIds:[], discount:10}',
    example: { buyQty: 2, getQty: 1 },
  })
  @IsObject()
  rules!: Record<string, unknown>;

  @ApiProperty({ example: '2026-03-01T00:00:00.000Z' })
  @IsDateString()
  validFrom!: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePromotionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  rules?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ApplyPromotionDto {
  @ApiProperty({ description: 'Order subtotal (UZS)', example: 75000 })
  subtotal!: number;

  @ApiProperty({
    description: 'Cart items',
    example: [{ productId: 'uuid', quantity: 2, unitPrice: 25000 }],
  })
  items!: Array<{ productId: string; quantity: number; unitPrice: number }>;
}
