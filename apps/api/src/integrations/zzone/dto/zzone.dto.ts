import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateZzoneOrderDto {
  @ApiProperty({ description: 'ZZone order ID (idempotency key)' })
  @IsString()
  zzoneOrderId!: string;

  @ApiProperty({ description: 'ZZone order number' })
  @IsString()
  orderNumber!: string;

  @ApiProperty({ description: 'RAOS Product UUID' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ description: 'Quantity', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty({ description: 'Total price' })
  @IsNumber()
  @Min(0)
  totalPrice!: number;

  @ApiProperty({ description: 'Payment method' })
  @IsString()
  paymentMethod!: string;

  @ApiPropertyOptional({ description: 'Client name' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: 'Client phone' })
  @IsOptional()
  @IsString()
  clientPhone?: string;

  @ApiPropertyOptional({ description: 'Delivery address' })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'New status: PENDING | CONFIRMED | COMPLETED | VOIDED | RETURNED' })
  @IsString()
  status!: string;

  @ApiProperty({ description: 'Seller (tenant) ID' })
  @IsUUID()
  sellerId!: string;
}

export class UpdateZzoneOrderDto {
  @ApiProperty({ description: 'Seller (tenant) ID' })
  @IsUUID()
  sellerId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientPhone?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSellerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;
}

export class UpdateStoreDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}
