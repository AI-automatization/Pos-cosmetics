import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseCategory } from '@prisma/client';

export class CreateExpenseDto {
  @ApiProperty({ enum: ExpenseCategory })
  @IsEnum(ExpenseCategory)
  category!: ExpenseCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: '2026-02-28' })
  @IsString()
  date!: string;
}

export class ExpenseFilterDto {
  @ApiPropertyOptional({ enum: ExpenseCategory })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiPropertyOptional({ example: '2026-02-01' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-02-28' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
