import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

const PROVIDERS = [
  'billz', 'yespos', 'moysklad', 'poster', 'iiko',
  'rkeeper', 'jowi', '1c', 'smartdo', 'optimo', 'csv',
] as const;

export class MigrationCredentialsDto {
  @ApiPropertyOptional({ description: 'Billz Secret Key' })
  @IsOptional()
  @IsString()
  secretKey?: string;

  @ApiPropertyOptional({ description: 'API Key (YesPOS, Poster, etc.)' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'API Secret (Jowi)' })
  @IsOptional()
  @IsString()
  apiSecret?: string;

  @ApiPropertyOptional({ description: 'Bearer token (MoySklad, Optimo)' })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiPropertyOptional({ description: 'iiko API Login' })
  @IsOptional()
  @IsString()
  apiLogin?: string;

  @ApiPropertyOptional({ description: 'Server URL (R-Keeper, Optimo)' })
  @IsOptional()
  @IsString()
  serverUrl?: string;

  @ApiPropertyOptional({ description: 'API URL (Optimo)' })
  @IsOptional()
  @IsString()
  apiUrl?: string;

  @ApiPropertyOptional({ description: 'CSV/XML data as string' })
  @IsOptional()
  @IsString()
  csvData?: string;

  @ApiPropertyOptional({ description: 'XML data (1C CommerceML)' })
  @IsOptional()
  @IsString()
  xmlData?: string;
}

export class StartMigrationDto {
  @ApiProperty({
    enum: PROVIDERS,
    description: 'Source system to migrate from',
  })
  @IsString()
  @IsIn(PROVIDERS)
  provider!: string;

  @ApiProperty({ type: MigrationCredentialsDto })
  @ValidateNested()
  @Type(() => MigrationCredentialsDto)
  credentials!: MigrationCredentialsDto;
}

export class ValidateCredentialsDto {
  @ApiProperty({ enum: PROVIDERS })
  @IsString()
  @IsIn(PROVIDERS)
  provider!: string;

  @ApiProperty({ type: MigrationCredentialsDto })
  @ValidateNested()
  @Type(() => MigrationCredentialsDto)
  credentials!: MigrationCredentialsDto;
}
