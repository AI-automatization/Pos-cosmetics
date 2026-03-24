import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreateDebtDto {
  @ApiProperty()
  @IsUUID()
  customerId!: string;

  @ApiPropertyOptional({ description: 'Related order ID' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ example: 150000, description: 'Total debt amount (UZS)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  totalAmount!: number;

  @ApiPropertyOptional({ description: 'Due date (ISO string)' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RecordDebtPaymentDto {
  @ApiProperty({ example: 50000, description: 'Payment amount' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ enum: PaymentMethod, default: 'CASH' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
