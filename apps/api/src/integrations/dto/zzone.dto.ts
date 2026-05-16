import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

// ─── Config DTO ────────────────────────────────────────────────────────

export class ConnectZzoneDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

// ─── Product Sync ──────────────────────────────────────────────────────

export class PushProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  stock!: number;
}

export class UpdateProductStockDto {
  @IsNumber()
  @Min(0)
  stock!: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;
}

// ─── Order Status ──────────────────────────────────────────────────────

export enum ZzoneOrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURNED = 'RETURNED',
}

export class UpdateOrderStatusDto {
  @IsEnum(ZzoneOrderStatus)
  status!: ZzoneOrderStatus;
}
