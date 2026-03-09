import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateLoyaltyConfigDto {
  @ApiPropertyOptional({ description: 'Loyalty dasturini yoq/yop' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 1000,
    description: '1 ball har earn_rate so\'m sarflanganda beriladi',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  earnRate?: number;

  @ApiPropertyOptional({
    example: 100,
    description: '1 ball = redeem_rate so\'m chegirma',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  redeemRate?: number;

  @ApiPropertyOptional({ example: 50, description: 'Minimal yechish miqdori (ball)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRedeem?: number;
}

export class EarnPointsDto {
  @ApiProperty({ description: 'Xaridor ID' })
  @IsString()
  customerId!: string;

  @ApiPropertyOptional({ description: 'Buyurtma ID (ixtiyoriy)' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiProperty({ example: 150000, description: 'Buyurtma jami summasi (so\'m)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  orderTotal!: number;
}

export class RedeemPointsDto {
  @ApiProperty({ description: 'Xaridor ID' })
  @IsString()
  customerId!: string;

  @ApiProperty({ example: 100, description: 'Yechiladigan ball miqdori' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  points!: number;
}

export class AdjustPointsDto {
  @ApiProperty({ description: 'Xaridor ID' })
  @IsString()
  customerId!: string;

  @ApiProperty({ example: 50, description: 'Musbat (+) yoki manfiy (-) ball' })
  @Type(() => Number)
  @IsNumber()
  points!: number;

  @ApiPropertyOptional({ description: 'Sabab / izoh' })
  @IsOptional()
  @IsString()
  note?: string;
}
