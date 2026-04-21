import { IsUUID, IsInt, IsPositive, IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpenTesterDto {
  @ApiProperty({ description: 'Mahsulot ID' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ description: 'Ombor ID' })
  @IsUUID()
  warehouseId!: string;

  @ApiProperty({ example: 1, description: 'Ochilgan tester soni' })
  @IsInt()
  @IsPositive()
  quantity!: number;

  @ApiProperty({ example: 50000, description: 'Tannarx (UZS) — xarajat hisobi uchun' })
  @IsNumber()
  @Min(0)
  costPrice!: number;

  @ApiPropertyOptional({ example: 'Namoyish uchun ochildi' })
  @IsOptional()
  @IsString()
  note?: string;
}
