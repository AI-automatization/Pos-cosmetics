import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({ example: 'CERT-2024-001234' })
  @IsString()
  @IsNotEmpty()
  certNumber!: string;

  @ApiProperty({ example: 'O\'zstandard' })
  @IsString()
  @IsNotEmpty()
  issuingAuthority!: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  issuedAt!: string;

  @ApiPropertyOptional({ example: '2026-01-15' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: 'https://storage.raos.uz/certs/abc.pdf' })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}

export class UpdateCertificateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issuingAuthority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issuedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;
}
