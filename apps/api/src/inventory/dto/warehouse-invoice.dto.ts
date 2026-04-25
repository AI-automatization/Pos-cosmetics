import { WriteOffReason } from '@prisma/client';
import {
  IsString, IsOptional, IsArray, IsNumber, Min, IsInt, IsPositive,
  ValidateNested, IsDateString, IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceItemDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  quantity!: number;

  // T-140: purchasePrice OR costPrice (mobile alias) — at least one required
  @ApiPropertyOptional({ example: 25000, description: 'Sotib olish narxi (UZS)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({ example: 25000, description: 'Mobile alias for purchasePrice' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({ example: 'BATCH-001' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ example: '2027-01-01', description: 'Muddati (YYYY-MM-DD) — ixtiyoriy' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class CreateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'Anvar Savdo', description: 'Supplier name — creates new supplier if supplierId omitted' })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiPropertyOptional({ example: 'INV-2026-001' })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];
}

export class WriteOffItemDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  qty!: number;
}

export class WriteOffDto {
  @ApiProperty({ enum: WriteOffReason })
  @IsEnum(WriteOffReason)
  reason!: WriteOffReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiProperty({ type: [WriteOffItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WriteOffItemDto)
  items!: WriteOffItemDto[];
}
