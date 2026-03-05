import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty()
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @ApiProperty({ example: 20000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountAmount?: number;
}

export enum DiscountTypeEnum {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  shiftId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ enum: DiscountTypeEnum, default: 'FIXED' })
  @IsOptional()
  @IsEnum(DiscountTypeEnum)
  discountType?: DiscountTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
