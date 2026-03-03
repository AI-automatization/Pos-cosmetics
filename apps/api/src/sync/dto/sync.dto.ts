import {
  IsString,
  IsEnum,
  IsObject,
  IsArray,
  ValidateNested,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SyncEventType {
  SALE_CREATED = 'SALE_CREATED',
  PAYMENT_SETTLED = 'PAYMENT_SETTLED',
  RETURN_CREATED = 'RETURN_CREATED',
  STOCK_MOVEMENT = 'STOCK_MOVEMENT',
}

export class SyncEventDto {
  @ApiProperty({ description: 'Unique key — takroriy yuborishdan himoya' })
  @IsString()
  idempotencyKey!: string;

  @ApiProperty({ enum: SyncEventType })
  @IsEnum(SyncEventType)
  type!: SyncEventType;

  @ApiProperty({ description: 'Event data (sale, payment, return, movement)' })
  @IsObject()
  payload!: Record<string, unknown>;

  @ApiProperty({ description: 'POS tomonidan berilgan tartib raqami' })
  sequenceNumber!: number;

  @ApiProperty({ description: 'POS qurilma ID' })
  @IsString()
  deviceId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;
}

export class InboundSyncDto {
  @ApiProperty({ type: [SyncEventDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncEventDto)
  events!: SyncEventDto[];
}

export class OutboundSyncQueryDto {
  @ApiProperty({ description: 'ISO timestamp — changes after this date will be returned' })
  @IsDateString()
  since!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branchId?: string;
}
