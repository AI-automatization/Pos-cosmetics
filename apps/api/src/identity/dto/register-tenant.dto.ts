import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterTenantDto {
  @ApiProperty({ example: 'My Store' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tenantName!: string;

  @ApiProperty({ example: 'my-store' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  @MinLength(3)
  @MaxLength(50)
  slug!: string;

  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName!: string;

  // T-079: Soliq ma'lumotlari (ixtiyoriy — keyinchalik to'ldiriladi)
  @ApiPropertyOptional({ example: '123456789', description: 'INN: 9 (yuridik) yoki 14 (jismoniy) raqam' })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{9}|\d{14})$/, { message: 'INN 9 yoki 14 raqamdan iborat bo\'lishi kerak' })
  inn?: string;

  @ApiPropertyOptional({ example: 'Mening Do\'konim MChJ', description: 'Rasmiy yuridik nomi' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({ example: 'Toshkent sh., Chilonzor t.', description: 'Yuridik manzil' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  legalAddress?: string;
}

// ─── Tenant soliq ma'lumotlarini yangilash DTO ────────────────────────────────

export class UpdateTenantInfoDto {
  @ApiPropertyOptional({ example: 'Yangi Do\'kon Nomi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @Matches(/^(\d{9}|\d{14})$/, { message: 'INN 9 yoki 14 raqamdan iborat bo\'lishi kerak' })
  inn?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  stir?: string;

  @ApiPropertyOptional({ example: '47.71' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  oked?: string;

  @ApiPropertyOptional({ example: 'Mening Do\'konim MChJ' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({ example: 'Toshkent sh., Chilonzor t.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  legalAddress?: string;
}
