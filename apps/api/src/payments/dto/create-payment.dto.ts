import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentIntentDto {
  @ApiProperty()
  @IsUUID()
  orderId!: string;

  @ApiProperty({ enum: PaymentMethod, example: 'CASH' })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiProperty({ example: 50000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ description: 'External provider reference' })
  @IsOptional()
  @IsString()
  providerRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provider?: string;
}

export class SplitPaymentDto {
  @ApiProperty({ type: [CreatePaymentIntentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentIntentDto)
  payments!: CreatePaymentIntentDto[];
}
