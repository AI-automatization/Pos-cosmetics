import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OpenShiftDto {
  @ApiProperty({ example: 50000, description: 'Opening cash amount (UZS)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  openingCash!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CloseShiftDto {
  @ApiProperty({ example: 120000, description: 'Actual cash in drawer' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  closingCash!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
