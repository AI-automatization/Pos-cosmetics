import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientLogDto {
  @ApiProperty({ enum: ['web', 'mobile', 'pos'], description: 'Client app source' })
  @IsString()
  @IsIn(['web', 'mobile', 'pos'])
  source!: string;

  @ApiProperty({ description: 'Error message' })
  @IsString()
  @MaxLength(2000)
  error!: string;

  @ApiPropertyOptional({ description: 'Error stack trace' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  stack?: string;

  @ApiPropertyOptional({ description: 'URL where error occurred' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @ApiPropertyOptional({ description: 'Browser/device user agent' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Tenant ID if available' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'User ID if available' })
  @IsOptional()
  @IsString()
  userId?: string;
}
