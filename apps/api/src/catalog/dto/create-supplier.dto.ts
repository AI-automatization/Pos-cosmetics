import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Romstal Uzb' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Romstal LLC' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: 'Toshkent, Chilonzor' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateSupplierDto {
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
  company?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
