import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StockMovementType } from '@prisma/client';

export class CreateStockMovementDto {
  @ApiProperty()
  @IsUUID()
  warehouseId!: string;

  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ enum: StockMovementType, example: 'IN' })
  @IsEnum(StockMovementType)
  type!: StockMovementType;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @ApiPropertyOptional({ example: 15000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Expiry date (ISO)' })
  @IsOptional()
  @IsString()
  expiryDate?: string;
}

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Asosiy Ombor' })
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

// ─── Batch Stock-In DTO (matches web frontend format) ─────────────────────────
export class StockInItemDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @ApiProperty({ example: 15000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Expiry date (ISO string)' })
  @IsOptional()
  @IsString()
  expiryDate?: string;
}

export class BatchStockInDto {
  @ApiProperty({ type: [StockInItemDto] })
  @Type(() => StockInItemDto)
  items!: StockInItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Optional warehouse ID; defaults to first warehouse' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;
}

// ─── Batch Stock-Out DTO ───────────────────────────────────────────────────────
export class StockOutItemDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  quantity!: number;
}

export class BatchStockOutDto {
  @ApiProperty({ type: [StockOutItemDto] })
  @Type(() => StockOutItemDto)
  items!: StockOutItemDto[];

  @ApiPropertyOptional({ example: 'WRITE_OFF', description: 'Reason for stock out' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Optional warehouse ID; defaults to first warehouse' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;
}

export class StockFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
