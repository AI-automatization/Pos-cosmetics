import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { IsUzPhone } from '../../common/pipes';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Aziz Karimov' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @IsUzPhone()
  phone?: string;

  @ApiPropertyOptional({ example: 'aziz@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '1995-06-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'Toshkent, Chilonzor' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'MALE', enum: ['MALE', 'FEMALE'] })
  @IsOptional()
  @IsIn(['MALE', 'FEMALE'])
  gender?: string;

  @ApiPropertyOptional({ example: 500000, description: 'Nasiya limiti (so\'m)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  debtLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Branch ID' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @IsUzPhone()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: ['MALE', 'FEMALE'] })
  @IsOptional()
  @IsIn(['MALE', 'FEMALE'])
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  debtLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
