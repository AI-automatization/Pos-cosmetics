import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
} from 'class-validator';
import { PaymentProviderType } from '@prisma/client';

export class UpsertPaymentProviderDto {
  @ApiPropertyOptional({
    description: 'Credentials to encrypt (merchantId, secretKey, etc.)',
    example: { merchantId: 'xxx', secretKey: 'yyy' },
  })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Non-sensitive settings (bankName, commissionRate, cardTypes)',
    example: { bankName: 'Kapitalbank', commissionRate: 1.5, cardTypes: ['UZCARD', 'HUMO'] },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Enable/disable this provider', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ProviderParamDto {
  @ApiProperty({ enum: PaymentProviderType })
  @IsEnum(PaymentProviderType)
  provider!: PaymentProviderType;
}

// Response types

export interface ProviderConfigSummary {
  provider: PaymentProviderType;
  isActive: boolean;
  settings: Record<string, unknown>;
  hasCredentials: boolean;
  verifiedAt: Date | null;
  createdAt: Date;
}

export interface ActiveProviderInfo {
  provider: PaymentProviderType;
  displayName: string;
  settings: Record<string, unknown>;
}
